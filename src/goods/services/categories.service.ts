import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesEntity } from '../entities/categories.entity';
import { In, Repository } from 'typeorm';
import { UtilsService } from './utils.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepo: Repository<CategoriesEntity>,
    private readonly utils: UtilsService,
  ) {}

  async getAllCategories() {
    return await this.categoriesRepo.find();
  }

  async deleteAll() {
    const all = await this.categoriesRepo.find();
    if (all.length) {
      await this.categoriesRepo.delete(all.map((e) => e._id));
    }
  }

  async saveCategories(categories) {
    const func = (th, e) => {
      const attr = e._attributes;
      const { id, ...rest } = attr;
      const name = e._text;
      return Object.assign({ id, name }, rest);
    };
    const all = await this.categoriesRepo.find();
    if (all.length) {
      await this.categoriesRepo.delete(all.map((e) => e._id));
    }
    const cats = this.utils.exFunc({ items: categories, th: this, func });
    const ids = cats.map((e) => e.id);
    const olders = await this.categoriesRepo.find({ where: { id: In(ids) } });
    const newOnes = cats.filter((e) => !olders.map((e) => e.id).includes(e.id));
    if (newOnes.length) {
      await this.categoriesRepo.save(newOnes);
    }
    return await this.categoriesRepo.find();
  }

  async getByName(name) {
    return await this.categoriesRepo.findOne({ where: { name } });
  }

  async getById(_id: string) {
    return await this.categoriesRepo.findOne(_id);
  }

  async getByOldId(id: string) {
    return await this.categoriesRepo.findOne({ where: { id } });
  }

  async save(data) {
    const all = this.categoriesRepo.create(data);
    return await this.categoriesRepo.save(all);
  }
}
