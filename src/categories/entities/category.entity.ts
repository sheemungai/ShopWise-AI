import {
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Category {
  @PrimaryGeneratedColumn()
  category_id!: number;

  @Column({ nullable: true })
  category_name!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  parent!: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @CreateDateColumn()
  createAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
