import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OffersEntity } from '../../goods/entities/offers.entity';
import { OrdersEntity } from './orders.entity';

@Entity({ name: 'order' })
export class OrderEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @ManyToOne(() => OffersEntity, (offer) => offer.orders)
  offer: OffersEntity;

  @Column({ default: 1 })
  count: number;

  @ManyToOne(() => OrdersEntity, (order) => order.offers)
  order: OrdersEntity;
}
