import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartItem } from 'src/carts/entities/cart-item.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderStatus } from './enums/order-status.enum';
import { Role } from 'src/users/enums/user-role.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async checkout(userId: number, checkoutDto: CheckoutDto) {
    return this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, {
        where: { user: { user_id: userId } },
        relations: { user: true },
      });
      if (!customer) {
        throw new NotFoundException('No customer profile found for this user');
      }

      const cart = await manager.findOne(Cart, {
        where: { customer: { customer_id: customer.customer_id } },
      });
      if (!cart) {
        throw new BadRequestException('Cart is empty');
      }

      const cartItems = await manager.find(CartItem, {
        where: {
          cart_item_id: In(checkoutDto.cart_item_ids),
          cart: { cart_id: cart.cart_id },
        },
        relations: { variant: { product: true } },
      });

      if (cartItems.length !== checkoutDto.cart_item_ids.length) {
        throw new NotFoundException(
          'One or more selected items were not found in your cart',
        );
      }

      // Validate stock for every item before touching anything
      for (const item of cartItems) {
        if (item.variant.stock < item.quantity) {
          throw new BadRequestException(
            `Only ${item.variant.stock} in stock for ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`,
          );
        }
      }

      // Decrement stock
      for (const item of cartItems) {
        await manager.decrement(
          ProductVariant,
          { variant_id: item.variant.variant_id },
          'stock',
          item.quantity,
        );
      }

      // Snapshot into order items
      const orderItems = cartItems.map((item) =>
        manager.create(OrderItem, {
          product_name: item.variant.product.name,
          size: item.variant.size,
          color: item.variant.color,
          price: item.variant.product.price,
          quantity: item.quantity,
          variant: item.variant,
        }),
      );

      const total = cartItems.reduce(
        (sum, item) => sum + Number(item.variant.product.price) * item.quantity,
        0,
      );

      const order = manager.create(Order, {
        customer,
        total,
        status: OrderStatus.pending,
        items: orderItems,
      });
      const savedOrder = await manager.save(order);

      // Remove only the checked-out items from the cart
      await manager.delete(CartItem, {
        cart_item_id: In(checkoutDto.cart_item_ids),
      });

      return this.findOne(savedOrder.order_id, {
        sub: userId,
        role: Role.customer,
      });
    });
  }

  async findAllForCustomer(userId: number) {
    const customer = await this.customerRepository.findOne({
      where: { user: { user_id: userId } },
      relations: { user: true },
    });
    if (!customer) {
      throw new NotFoundException('No customer profile found for this user');
    }
    return this.orderRepository.find({
      where: { customer: { customer_id: customer.customer_id } },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.orderRepository.find({
      relations: { items: true, customer: { user: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, requestingUser: { sub: number; role: Role }) {
    const order = await this.orderRepository.findOne({
      where: { order_id: id },
      relations: { items: true, customer: { user: true } },
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const isOwner = order.customer.user.user_id === requestingUser.sub;
    const isAdmin = requestingUser.role === Role.admin;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { order_id: id },
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    order.status = status;
    return this.orderRepository.save(order);
  }
}
