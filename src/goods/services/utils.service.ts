import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesEntity } from '../entities/categories.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UtilsService {
  constructor() {}

  exFunc({ items, th, func }): any {
    if (Array.isArray(items)) {
      return items.map(func.bind(null, th));
    } else {
      return [func(th, items)];
    }
  }
}
