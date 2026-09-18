import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from 'src/customers/entities/customer.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  order_id!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.pending })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  customer!: Customer;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
