import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Customer, ProductVariant]),
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [TypeOrmModule],
})
export class CartsModule {}
