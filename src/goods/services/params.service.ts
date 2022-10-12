import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OffersEntity } from '../entities/offers.entity';
import { ParamsEntity } from '../entities/params.entity';
import { UtilsService } from './utils.service';

@Injectable()
export class ParamsService {
  constructor(
    @InjectRepository(ParamsEntity)
    private readonly paramsRepo: Repository<ParamsEntity>,
    private readonly utils: UtilsService,
  ) {}

  async getById(_id: string) {
    return await this.paramsRepo.findOne(_id);
  }

  create(elems) {
    return this.paramsRepo.create(elems);
  }

  async getUserByOldId(id: string) {
    return await this.paramsRepo.findOne({ where: { id } });
  }

  async save(data) {
    return await this.paramsRepo.save(data);
  }
}
