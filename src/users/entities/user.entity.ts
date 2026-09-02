import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/user-role.enum';
import { Exclude } from 'class-transformer';
import { Customer } from 'src/customers/entities/customer.entity';
import { Seller } from 'src/sellers/entities/seller.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: Role, default: Role.customer })
  role!: Role;

  @Column()
  phone!: string;

  @Exclude()
  @Column({ type: 'text', nullable: true, default: null })
  hashedRefreshToken!: string | null;

  @OneToOne(() => Customer, (customer) => customer.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  customer!: Customer;

  @OneToOne(() => Seller, (seller) => seller.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  seller!: Seller;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
