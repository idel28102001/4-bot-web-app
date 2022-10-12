import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { GroupsEntity } from '../entities/groups.entity';
import { MarketsEntity } from '../entities/markets.entity';
import { UtilsService } from './utils.service';
import { CategoriesService } from './categories.service';
import { CurrenciesService } from './currencies.service';
import { OffersService } from './offers.service';
import { ParamsService } from './params.service';
import { GoodService } from './good.service';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(MarketsEntity)
    private readonly marketsRepo: Repository<MarketsEntity>,
    private readonly categoriesService: CategoriesService,
    private readonly currenciesService: CurrenciesService,
    private readonly offersService: OffersService,
    private readonly utils: UtilsService,
    private readonly paramsService: ParamsService,
    private readonly goodService: GoodService,
  ) {}

  async saveFromTilda(elements, goodsEnts) {
    await this.clearAll();

    const gg = this.goodService.create(
      goodsEnts.map((e) => {
        return { id: e };
      }),
    );
    const goods = await this.goodService.save(gg);
    const market =
      (
        await this.marketsRepo.find({
          relations: ['categories', 'currencies', 'offers'],
        })
      )[0] || this.marketsRepo.create({});
    const cats = [];
    elements.forEach((e) => cats.push(...e.categories));
    const categories = Array.from(new Set(cats)).map((e) => {
      return { name: e };
    });
    market.categories = await this.categoriesService.save(categories);
    const currencies = this.currenciesService.create([
      { id: 'RUB', rate: '1' },
    ]);
    const curr = await this.currenciesService.save(currencies);
    market.currencies = curr;
    const allElems = await Promise.all(
      elements.map(async (e) => {
        let category = e.categories.slice(-1)[0];
        if (category) {
          category = await this.categoriesService.getByName(category);
        }
        return this.offersService.create({
          name: e.title,
          description: e.description,
          picture: e.picture,
          price: e.price,
          oldprice: e.oldPrice,
          params: this.paramsService.create(e.params),
          category,
          currency: curr[0],
          id: e.id,
          good: goods.find((elem) => elem.id === e.good),
          quantity: e.quantity,
        });
      }),
    );
    market.offers = await this.offersService.save(allElems);
    await this.marketsRepo.save(market);
  }

  async clearAll() {
    await this.offersService.deleteAll();
    await this.categoriesService.deleteAll();
    await this.currenciesService.deleteAll();
    await this.goodService.deleteAll();
  }

  async saveMarkets(object) {
    await this.offersService.deleteAll();
    const categories = await this.categoriesService.saveCategories(
      object.yml_catalog.shop.categories.category,
    );
    const currencies = await this.currenciesService.saveCurrencies(
      object.yml_catalog.shop.currencies.currency,
    );
    const offers = await this.offersService.saveOffers(
      this,
      object.yml_catalog.shop.offers.offer,
    );
    const shop = object.yml_catalog.shop;
    const { _text: name } = shop.name;
    const { _text: company } = shop.company;
    const { _text: url } = shop.url;
    const { _text: platform } = shop.platform;
    const { _text: version } = shop.version;
    const mark = (await this.marketsRepo.find())[0] || {};
    const market = Object.assign(mark, {
      name,
      company,
      url,
      platform,
      version,
      categories,
      currencies,
      offers,
    });
    return await this.marketsRepo.save(market);
  }

  async getById(_id: number, options?: FindOneOptions<MarketsEntity>) {
    return await this.marketsRepo.findOne(_id, options);
  }

  async getUserByOldId(id: string) {
    return await this.marketsRepo.findOne({ where: { id } });
  }

  async save(data) {
    return await this.marketsRepo.save(data);
  }
}
