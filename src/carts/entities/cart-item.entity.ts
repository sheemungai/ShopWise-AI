import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  cart_item_id!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart!: Cart;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  variant!: ProductVariant;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
