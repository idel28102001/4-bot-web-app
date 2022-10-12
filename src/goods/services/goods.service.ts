import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UtilsService } from './utils.service';
import { MarketsService } from './markets.service';
import { OffersService } from './offers.service';
import { of } from 'rxjs';
import { CategoriesService } from './categories.service';
import * as fs from 'fs';
import { GoodService } from './good.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yml = require('yandex-market-language');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const convert = require('xml-js');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const csvtojsonV2 = require('csvtojson/v2');

@Injectable()
export class GoodsService {
  constructor(
    private readonly utils: UtilsService,
    private readonly marketService: MarketsService,
    private readonly offersService: OffersService,
    private readonly categoriesService: CategoriesService,
    private readonly goodService: GoodService,
  ) {}

  async downloadTilda(link: string) {
    await axios
      .get(link, { headers: { 'content-type': 'text/csv' } })
      .then(async (e) => {
        csvtojsonV2({ noheader: false, delimiter: ';' })
          .fromString(e.data)
          .then(async (e) => {
            const elements = this.gatherCsvInfo(e);
            await this.marketService.saveFromTilda(
              elements.elems,
              elements.goods,
            );
          });
      });
  }

  getAllInfo(elem) {
    const title = elem.Title;
    const description = elem.Text;
    const categories = elem.Category.split(';');
    const params = Object.keys(elem)
      .filter((e) => e.startsWith('Characteristics'))
      .map((e) => {
        return { name: e.split(':').slice(-1)[0], text: elem[e] };
      });
    const picture = elem.Photo;
    return { title, description, categories, params, picture };
  }

  gatherCsvInfo(array) {
    let firstInfo = this.getAllInfo(array[0]);
    const allElems = [];
    const goods = [];
    let good = -1;
    for (let idx = 0; idx < array.length; idx++) {
      const curr = array[idx];
      if (curr.Category || idx === 0) {
        firstInfo = this.getAllInfo(array[idx]);
        goods.push(++good);
        const next = array[Number(idx) + 1];
        const size = {
          name: 'Размер',
          text: curr.Description.split(':').slice(-1)[0],
        };
        const params = [...firstInfo.params, ...[size]];
        const price = Math.round(Number(next.Price)).toString();
        const oldPrice = next['Price Old'];
        allElems.push({
          ...firstInfo,
          ...{
            price,
            oldPrice,
            params,
            good,
            id: curr['Tilda UID'],
            quantity: null,
          },
        });
        continue;
      }
      const size = {
        name: 'Размер',
        text: curr.Editions.split(':').slice(-1)[0],
      };
      const params = [...firstInfo.params, ...[size]];
      const price = Math.round(Number(curr.Price)).toString();
      const oldPrice = curr['Price Old'];
      allElems.push({
        ...firstInfo,
        ...{
          price,
          oldPrice,
          params,
          good,
          id: curr['Tilda UID'],
          quantity: curr['Quantity'],
        },
      });
    }
    return { elems: allElems, goods };
  }

  async downloadYml(link: string) {
    await axios
      .get(link, { headers: { 'content-type': 'image/svg+xml' } })
      .then(async (e) => {
        const res = convert.xml2js(e.data, { compact: true, spaces: 4 });
        await this.marketService.saveMarkets(res);
      });
  }

  async getMarket() {
    const market = await this.marketService.getById(1, {
      relations: [
        'currencies',
        'categories',
        'offers',
        'offers.group',
        'offers.params',
        'offers.currency',
        'offers.category',
      ],
    });
    const result = {
      name: market.name,
      company: market.company,
      url: market.url,
      'delivery-options': [],
      platform: market.platform,
      currencies: market.currencies.map((e) => {
        const { _id, ...rest } = e;
        return rest;
      }),
      categories: market.categories.map((e) => {
        const { _id, ...rest } = e;
        const aa = { name: rest.name };
        if (rest.id) {
          Object.assign(aa, { id: rest.id });
        } else {
          Object.assign(aa, { id: _id.toString() });
        }
        return aa;
      }),
      offers: market.offers.map((e) => {
        const {
          currency,
          category,
          params,
          _id,
          vendorcode,
          group,
          oldprice,
          price,
          picture,
          ...rest
        } = e;
        const param = params.map((e) => {
          const { _id, text, ...rest } = e;
          return { value: text, ...rest };
        });
        const aa = {
          currencyId: currency.id,
          categoryId: category.id || category._id.toString(),
          param,
          oldprice: Number(oldprice),
          price: Number(price),
          name: rest.name,
          id: rest.id || _id.toString(),
          picture: picture ? picture.split(' ') : [],
        };
        if (group) {
          Object.assign(aa, { group_id: group.id });
        }
        if (vendorcode) {
          Object.assign(aa, { vendorCode: vendorcode });
        }
        return aa;
      }),
    };
    return yml(result).end({ pretty: true });
  }

  async getGoodsByCategory(_id, query) {
    const { offset = 0, limit = 20 } = query;
    const all = await this.offersService.getMany({
      where: { group: { _id } },
      relations: ['currency', 'params', 'group', 'category'],
      skip: offset,
      take: limit,
    });
    return all.map(this.gatherInfo);
  }

  async getShortGoods(query) {
    const { offset = 0, limit = 3 } = query;
    const all = await this.offersService.getMany({
      skip: offset,
      take: limit,
      select: ['oldprice', 'price', 'name', 'picture', '_id', 'id'],
      relations: ['currency', 'group', 'params', 'category'],
    });
    return all.map(this.gatherInfo);
  }

  gatherInfo(element) {
    const { picture, id, ...rest } = element;
    const pictures = picture.split(' ');
    return { ...rest, offerdId: id, pictures };
  }

  async CSVGood(_id: number) {
    const result = await this.goodService.getById(_id, {
      relations: [
        'offers',
        'offers.params',
        'offers.currency',
        'offers.category',
      ],
    });
    return this.getOffers(result.offers);
    // const { id, picture, ...rest } = result;
    // return { offerId: id, pictures: picture.split(' '), ...rest };
  }

  async getShortGoodsCSV(query) {
    const { offset = 0, limit = 3 } = query;
    const offers = await this.goodService.getMany({
      skip: offset,
      take: limit,
      relations: [
        'offers',
        'offers.currency',
        'offers.group',
        'offers.params',
        'offers.category',
      ],
    });
    return offers.map(this.getOffers);
  }

  getOffers(e) {
    const offer = e.offers ? e.offers[0] : e[0] ? e[0] : e;
    const params = offer.params.filter((e) => e.name !== 'Размер');
    const offs = e.offers;
    let offerId;
    const sizes = (e.offers ? e.offers : e)
      .filter((e) => {
        const value = e.params.find((e) => e.name === 'Размер').text;
        if (/[\(\)]/.test(value) || !value) {
          offerId = e.id;
        } else {
          return true;
        }
      })
      .map((e) => {
        const value = e.params.find((e) => e.name === 'Размер').text;
        return {
          offerId: e.id,
          value,
          quantity: Number(e.quantity) || null,
        };
      });
    return {
      name: offer.name,
      description: offer.description,
      pictures: offer.picture.split(' '),
      price: offer.price,
      oldprice: offer.oldprice,
      offerId,
      _id: e._id,
      category: offer.category || null,
      params,
      modifications: { text: 'Размер', values: sizes },
    };
  }

  async getById(id) {
    const one = await this.offersService.getById(id, {
      relations: ['currency', 'params', 'group', 'category'],
    });
    return this.gatherInfo(one);
  }

  async getCategories() {
    return await this.categoriesService.getAllCategories();
  }
}
