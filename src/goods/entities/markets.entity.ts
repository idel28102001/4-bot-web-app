import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OffersEntity } from './offers.entity';
import { CurrenciesEntity } from './currencies.entity';
import { CategoriesEntity } from './categories.entity';

@Entity({ name: 'markets' })
export class MarketsEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @Column({ default: 'НАЗВАНИЕ' })
  name: string;

  @Column({ default: 'НАЗВАНИЕ' })
  company: string;

  @Column({ default: 'https://DOMEN.ru' })
  url: string;

  @Column({ default: 'НАЗВАНИЕ' })
  platform: string;

  @Column({ default: '1.0' })
  version: string;

  @OneToMany(() => CurrenciesEntity, (curr) => curr.market)
  currencies: CurrenciesEntity[];

  @OneToMany(() => CategoriesEntity, (cats) => cats.market)
  categories: CategoriesEntity[];

  @OneToMany(() => OffersEntity, (offer) => offer.market)
  offers: OffersEntity[];
}
