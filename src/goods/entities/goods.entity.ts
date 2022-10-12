import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OffersEntity } from './offers.entity';

@Entity({ name: 'goods' })
export class GoodsEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @Column({ unique: true })
  id: string;

  @OneToMany(() => OffersEntity, (offer) => offer.good, {
    onDelete: 'CASCADE',
  })
  offers: OffersEntity[];
}
