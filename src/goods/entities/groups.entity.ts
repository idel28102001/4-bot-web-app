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

@Entity({ name: 'groups' })
export class GroupsEntity {
  @PrimaryGeneratedColumn('increment')
  _id: number;

  @Column({ unique: true })
  id: string;

  @OneToMany(() => OffersEntity, (offer) => offer.group, {
    onDelete: 'CASCADE',
  })
  offers: OffersEntity[];
}
