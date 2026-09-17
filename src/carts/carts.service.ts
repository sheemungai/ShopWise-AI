import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  private shapeItem(item: CartItem) {
    const product = item.variant.product;
    return {
      cart_item_id: item.cart_item_id,
      quantity: item.quantity,
      size: item.variant.size,
      color: item.variant.color,
      product_id: product.product_id,
      product_name: product.name,
      price: Number(product.price),
      image: product.images?.[0] ?? null,
      subtotal: Number(product.price) * item.quantity,
      available: item.variant.stock >= item.quantity,
      currentStock: item.variant.stock,
    };
  }

  private async getOrCreateCart(userId: number): Promise<Cart> {
    const customer = await this.customerRepository.findOne({
      where: { user: { user_id: userId } },
      relations: { user: true },
    });
    if (!customer) {
      throw new NotFoundException('No customer profile found for this user');
    }

    let cart = await this.cartRepository.findOne({
      where: { customer: { customer_id: customer.customer_id } },
    });

    if (!cart) {
      cart = this.cartRepository.create({ customer, items: [] });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    const fullCart = await this.cartRepository.findOne({
      where: { cart_id: cart.cart_id },
      relations: { items: { variant: { product: true } } },
    });

    const items = fullCart!.items.map((item) => this.shapeItem(item));
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return { cart_id: fullCart!.cart_id, items, total };
  }

  async addItem(userId: number, addItemDto: AddItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const variant = await this.variantRepository.findOne({
      where: { variant_id: addItemDto.variant_id },
      relations: { product: true },
    });
    if (!variant) {
      throw new NotFoundException(
        `Variant with id ${addItemDto.variant_id} not found`,
      );
    }
    if (variant.stock < addItemDto.quantity) {
      throw new BadRequestException(
        `Only ${variant.stock} in stock for this item`,
      );
    }

    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cart: { cart_id: cart.cart_id },
        variant: { variant_id: addItemDto.variant_id },
      },
      relations: { variant: { product: true } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + addItemDto.quantity;
      if (variant.stock < newQuantity) {
        throw new BadRequestException(
          `Only ${variant.stock} in stock; you already have ${existingItem.quantity} in your cart`,
        );
      }
      existingItem.quantity = newQuantity;
      const saved = await this.cartItemRepository.save(existingItem);
      return this.shapeItem(saved);
    }

    const newItem = this.cartItemRepository.create({
      cart,
      variant,
      quantity: addItemDto.quantity,
    });
    const saved = await this.cartItemRepository.save(newItem);
    return this.shapeItem(saved);
  }

  async updateItem(
    userId: number,
    itemId: number,
    updateItemDto: UpdateItemDto,
  ) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemRepository.findOne({
      where: { cart_item_id: itemId, cart: { cart_id: cart.cart_id } },
      relations: { variant: { product: true } },
    });
    if (!item) {
      throw new NotFoundException(
        `Item with id ${itemId} not found in your cart`,
      );
    }

    if (item.variant.stock < updateItemDto.quantity) {
      throw new BadRequestException(
        `Only ${item.variant.stock} in stock for this item`,
      );
    }

    item.quantity = updateItemDto.quantity;
    const saved = await this.cartItemRepository.save(item);
    return this.shapeItem(saved);
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);
    const result = await this.cartItemRepository.delete({
      cart_item_id: itemId,
      cart: { cart_id: cart.cart_id },
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Item with id ${itemId} not found in your cart`,
      );
    }
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepository.delete({ cart: { cart_id: cart.cart_id } });
    return { message: 'Cart cleared' };
  }
}
