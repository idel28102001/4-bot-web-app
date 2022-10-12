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

@Entity({ name: 'params' })
export class ParamsEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @Column()
  text: string;

  @Column()
  name: string;

  @ManyToOne(() => OffersEntity, (offer) => offer.params, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  offer: OffersEntity;
}
