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

@Entity({ name: 'categories' })
export class CategoriesEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @Column({ unique: true, nullable: true })
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => MarketsEntity, (market) => market.categories)
  market: MarketsEntity;

  @OneToMany(() => OffersEntity, (offer) => offer.category, {
    onDelete: 'CASCADE',
  })
  offer: OffersEntity[];
}
