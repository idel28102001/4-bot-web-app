import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CurrenciesEntity } from './currencies.entity';
import { CategoriesEntity } from './categories.entity';
import { ParamsEntity } from './params.entity';
import { GroupsEntity } from './groups.entity';
import { MarketsEntity } from './markets.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { GoodsEntity } from './goods.entity';

@Entity({ name: 'offers' })
export class OffersEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @ManyToOne(() => MarketsEntity, (market) => market.offers)
  market: MarketsEntity;

  @Column({ unique: true, nullable: true })
  id: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  vendorcode: string;

  @Column()
  picture: string;

  @Column({ nullable: true })
  url: string;

  @Column()
  price: string;

  @Column()
  oldprice: string;

  @Column({ nullable: true })
  quantity: string;

  @ManyToOne(() => CurrenciesEntity, (currency) => currency.offer)
  currency: CurrenciesEntity;

  @ManyToOne(() => CategoriesEntity, (cat) => cat.offer)
  category: CategoriesEntity;

  @ManyToOne(() => GroupsEntity, (groups) => groups.offers, { nullable: true })
  group: GroupsEntity;

  @ManyToOne(() => GoodsEntity, (groups) => groups.offers, { nullable: true })
  good: GoodsEntity;

  @OneToMany(() => ParamsEntity, (param) => param.offer, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    cascade: true,
  })
  params: ParamsEntity[];

  @OneToMany(() => OrderEntity, (order) => order.offer, { onDelete: 'CASCADE' })
  orders: OrderEntity[];
}
