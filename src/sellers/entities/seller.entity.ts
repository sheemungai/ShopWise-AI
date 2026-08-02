import { User } from 'src/users/entities/user.entity';
import { Column, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { OneToOne } from 'typeorm/browser';

export class Seller {
  @PrimaryGeneratedColumn()
  seller_id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  phone!: string;

  @Column()
  gender!: string;

  @Column()
  address!: string;

  @OneToOne(() => User, (user) => user.seller, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user!: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
