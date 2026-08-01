import { User } from 'src/users/entities/user.entity';
import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export class Customer {
  @PrimaryGeneratedColumn()
  customer_id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  gender!: string;

  @Column()
  phone!: string;

  @Column()
  address!: string;

  @OneToOne(() => User, (user) => user.customer, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user!: User;
}
