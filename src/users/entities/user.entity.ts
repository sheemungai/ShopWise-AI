import { Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enums/user-role.enum';
import { Exclude } from 'class-transformer';
import { Customer } from 'src/customers/entities/customer.entity';

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

  @OneToOne(() => Customer, (customer) => customer.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  customer!: Customer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
