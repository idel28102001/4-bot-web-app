import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEnum } from '../enums/Role.enum';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  firstname: string;

  @Column({ nullable: true })
  lastname: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ default: RoleEnum.ADMIN })
  role: string;

  @Column({ default: true })
  notice: boolean;

  @Column()
  telegramId: string;
}
