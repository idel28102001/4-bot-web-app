import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { OffersEntity } from '../entities/offers.entity';
import { UtilsService } from './utils.service';
import { GroupsService } from './groups.service';
import { CurrenciesService } from './currencies.service';
import { CategoriesService } from './categories.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OffersEntity)
    private readonly offersRepo: Repository<OffersEntity>,
    private readonly groupsSerivce: GroupsService,
    private readonly currenciesSerivce: CurrenciesService,
    private readonly categoriesService: CategoriesService,
    private readonly utils: UtilsService,
  ) {}

  async getByOfferId(offerId: string, options?: FindOneOptions<OffersEntity>) {
    return await this.offersRepo.findOne({
      ...{ where: { id: offerId } },
      ...options,
    });
  }

  create(elems) {
    return this.offersRepo.create(elems);
  }

  async getMany(options?: FindManyOptions<OffersEntity>) {
    return await this.offersRepo.find(options);
  }

  async deleteAll() {
    const all = await this.offersRepo.find();
    if (all.length) {
      await this.offersRepo.delete(all.map((e) => e._id));
    }
  }

  async saveOffers(th, offers) {
    const offs = this.utils.exFunc({ items: offers, th, func: this.getOffer });
    const some = await this.offersRepo.find({
      where: { id: In(offs.map((e) => e.id)) },
    });
    const result = offs.map((e) => {
      if (some.map((e) => e.id).includes(e.id)) {
        return Object.assign(
          some.find((elem) => elem.id === e.id),
          e,
        );
      }
      return e;
    });
    await this.groupsSerivce.saveGroups(
      Array.from(new Set(result.map((e) => e.group))).filter((e) => e),
    );
    const toSave = await Promise.all(
      result.map(async (e) => {
        const group = await this.groupsSerivce.getByOldId(e.group);
        const currency = await this.currenciesSerivce.getByOldId(e.currency);
        const category = await this.categoriesService.getByOldId(e.category);
        return Object.assign(e, { currency, category, group });
      }),
    );
    return await this.offersRepo.save(toSave);
  }

  getOffer(th, offer) {
    const { id, group_id: group } = offer._attributes || {};
    const { _text: name } = offer.name || {};
    const { _text: vendorcode } = offer.vendorCode || {};
    const { _cdata: description } = offer.description || {};
    const { _text: picture } = offer.picture || {};
    const { _text: url } = offer.url || {};
    const { _text: price } = offer.price || {};
    const { _text: oldprice } = offer.oldprice || {};
    const { _text: currency } = offer.currencyId || {};
    const { _text: category } = offer.categoryId || {};
    const func = (thi, e) => {
      const attrs = e._attributes;
      const { name, ...rest } = attrs;
      const text = e._text;
      return { text, name };
    };
    const params = th.utils.exFunc({ items: offer.param || [], th, func });
    return {
      id,
      group,
      name,
      vendorcode,
      description,
      picture,
      url,
      price,
      oldprice,
      currency,
      category,
      params,
    };
  }

  async getById(_id: string | number, options?: FindOneOptions<OffersEntity>) {
    return await this.offersRepo.findOne(_id, options);
  }

  async getUserByOldId(id: string) {
    return await this.offersRepo.findOne({ where: { id } });
  }

  async save(data) {
    return await this.offersRepo.save(data);
  }
}
