import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UtilsService } from './utils.service';
import { GoodsEntity } from '../entities/goods.entity';

@Injectable()
export class GoodService {
  constructor(
    @InjectRepository(GoodsEntity)
    private readonly goodRepo: Repository<GoodsEntity>,
    private readonly utils: UtilsService,
  ) {}

  async getMany(options?: FindManyOptions<GoodsEntity>) {
    return await this.goodRepo.find(options);
  }

  async getById(_id: string | number, options?: FindOneOptions<GoodsEntity>) {
    return await this.goodRepo.findOne(_id, options);
  }

  create(elems) {
    return this.goodRepo.create(elems);
  }

  async deleteAll() {
    const all = await this.goodRepo.find();
    if (all.length) {
      await this.goodRepo.delete(all.map((e) => e._id));
    }
  }

  async getUserByOldId(id: string) {
    return await this.goodRepo.findOne({ where: { id } });
  }

  async save(data) {
    return await this.goodRepo.save(data);
  }
}
