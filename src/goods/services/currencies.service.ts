import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesEntity } from '../entities/categories.entity';
import { In, Repository } from 'typeorm';
import { CurrenciesEntity } from '../entities/currencies.entity';
import { UtilsService } from './utils.service';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(CurrenciesEntity)
    private readonly currenciesRepo: Repository<CurrenciesEntity>,
    private readonly utils: UtilsService,
  ) {}

  create(elems) {
    return this.currenciesRepo.create(elems);
  }

  async deleteAll() {
    const all = await this.currenciesRepo.find();
    if (all.length) {
      await this.currenciesRepo.delete(all.map((e) => e._id));
    }
  }

  async saveCurrencies(currencies) {
    const currFunc = (th, e) => {
      const attr = e._attributes;
      const { id, rate, ...rest } = attr;
      return Object.assign({ id, rate: Number(rate) }, rest);
    };
    const currs = this.utils.exFunc({
      items: currencies,
      th: this,
      func: currFunc,
    });
    const all = await this.currenciesRepo.find();
    if (all.length) {
      await this.currenciesRepo.delete(all.map((e) => e._id));
    }
    const ids = currs.map((e) => e.id);
    const olders = await this.currenciesRepo.find({ where: { id: In(ids) } });
    const newOnes = currs.filter(
      (e) => !olders.map((e) => e.id).includes(e.id),
    );
    if (newOnes.length) {
      await this.currenciesRepo.save(newOnes);
    }
    return await this.currenciesRepo.find();
  }

  async getById(_id: string) {
    return await this.currenciesRepo.findOne(_id);
  }

  async getByOldId(id: string) {
    return await this.currenciesRepo.findOne({ where: { id } });
  }

  async save(data) {
    return await this.currenciesRepo.save(data);
  }
}
