import { Column, Entity } from 'typeorm';

@Entity()
export class Payment {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totaal!: number;
}
