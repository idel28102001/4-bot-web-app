import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity({ name: 'orders' })
export class OrdersEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => OrderEntity, (order) => order.offer, { cascade: true })
  offers: OrderEntity[];

  @Column()
  phone: string;

  @Column()
  name: string;
}
