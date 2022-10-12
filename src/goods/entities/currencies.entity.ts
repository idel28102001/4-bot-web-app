import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OffersEntity } from './offers.entity';
import { MarketsEntity } from './markets.entity';

@Entity({ name: 'currencies' })
export class CurrenciesEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @Column({ unique: true })
  id: string;

  @Column()
  rate: number;

  @ManyToOne(() => MarketsEntity, (market) => market.currencies)
  market: MarketsEntity;

  @OneToMany(() => OffersEntity, (offer) => offer.currency, {
    onDelete: 'CASCADE',
  })
  offer: OffersEntity[];
}
