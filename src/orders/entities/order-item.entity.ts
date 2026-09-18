import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  order_item_id!: number;

  @Column()
  product_name!: string;

  @Column()
  size!: string;

  @Column()
  color!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', nullable: true })
  variant!: ProductVariant | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
