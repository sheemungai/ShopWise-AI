import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Role } from 'src/users/enums/user-role.enum';
import { DataSource } from 'typeorm/browser';
import { Seller } from 'src/sellers/entities/seller.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    requestingUser: { sub: number; role: Role },
  ) {
    return this.dataSource.transaction(async (manager) => {
      const seller = await manager.findOne(Seller, {
        where: { user: { user_id: requestingUser.sub } },
        relations: { user: true },
      });

      if (!seller) {
        throw new ForbiddenException(
          ' Only seller are alowed to create products',
        );
      }

      const { category_ids, variants, ...rest } = createProductDto;

      const categories = await manager.find(Category, {
        where: { category_id: In(category_ids) },
      });
      if (categories.length !== category_ids.length) {
        throw new NotFoundException('One or more categories not found');
      }

      const product = manager.create(Product, {
        ...rest,
        seller,
        categories,
      });
      const savedProduct = await manager.save(product);

      const variantEntities = variants.map((variant) =>
        manager.create(ProductVariant, {
          ...variant,
          product: savedProduct,
        }),
      );
      await manager.save(variantEntities);

      const createdProduct = await manager.findOne(Product, {
        where: { product_id: savedProduct.product_id },
        relations: { seller: true, categories: true, variants: true },
      });

      if (!createdProduct) {
        throw new NotFoundException(
          `Product with id ${savedProduct.product_id} not found`,
        );
      }

      return createdProduct;
    });
  }

  async findAll() {
    return this.productRepository.find({
      relations: { seller: true, categories: true, variants: true },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { product_id: id },
      relations: { seller: true, categories: true, variants: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  private async checkOwnership(
    productId: number,
    requestingUser: { sub: number; role: Role },
  ) {
    const product = await this.productRepository.findOne({
      where: { product_id: productId },
      relations: { seller: { user: true } },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const isOwner = product.seller.user.user_id === requestingUser.sub;
    const isAdmin = requestingUser.role === Role.admin;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only manage your own products');
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    requestingUser: { sub: number; role: Role },
  ) {
    await this.checkOwnership(id, requestingUser);

    const { category_ids, ...rest } = updateProductDto;
    const product = await this.productRepository.findOne({
      where: { product_id: id },
      relations: { categories: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    if (category_ids) {
      const categories = await this.productRepository.manager.find(Category, {
        where: { category_id: In(category_ids) },
      });
      if (categories.length !== category_ids.length) {
        throw new NotFoundException('One or more categories were not found');
      }
      product.categories = categories;
    }

    Object.assign(product, rest);
    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async remove(id: number, requestingUser: { sub: number; role: Role }) {
    await this.checkOwnership(id, requestingUser);
    return this.productRepository.delete(id);
  }

  async addVariant(
    productId: number,
    createVariantDto: CreateVariantDto,
    requestingUser: { sub: number; role: Role },
  ) {
    const product = await this.checkOwnership(productId, requestingUser);
    const variant = this.variantRepository.create({
      ...createVariantDto,
      product,
    });
    return this.variantRepository.save(variant);
  }

  async updateVariant(
    productId: number,
    variantId: number,
    updateVariantDto: UpdateProductDto,
    requestingUser: { sub: number; role: Role },
  ) {
    await this.checkOwnership(productId, requestingUser);

    const variant = await this.variantRepository.findOne({
      where: { variant_id: variantId, product: { product_id: productId } },
    });
    if (!variant) {
      throw new NotFoundException(
        `Variant with id ${variantId} not found on this product`,
      );
    }

    Object.assign(variant, updateVariantDto);
    return this.variantRepository.save(variant);
  }

  async removeVariant(
    productId: number,
    variantId: number,
    requestingUser: { sub: number; role: Role },
  ) {
    await this.checkOwnership(productId, requestingUser);

    const variant = await this.variantRepository.findOne({
      where: { variant_id: variantId, product: { product_id: productId } },
    });
    if (!variant) {
      throw new NotFoundException(
        `Variant with id ${variantId} not found on this product`,
      );
    }

    return this.variantRepository.delete(variantId);
  }
}
