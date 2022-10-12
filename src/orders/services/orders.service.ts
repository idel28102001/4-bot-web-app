import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdersEntity } from '../entities/orders.entity';
import { Repository } from 'typeorm';
import { OrderDto } from '../dtos/order.dto';
import { OrderEntity } from '../entities/order.entity';
import { OffersService } from '../../goods/services/offers.service';
import { orderOne } from '../dtos/orderOne.dto';
import { Telegraf } from 'telegraf';
import { UsersService } from '../../users/services/users.service';

const axios = require('axios').default;

@Injectable()
export class OrdersService {
  private readonly telegraf = new Telegraf(process.env.TOKEN);

  constructor(
    @InjectRepository(OrdersEntity)
    private readonly ordersRepo: Repository<OrdersEntity>,
    private readonly offersService: OffersService,
    private readonly usersService: UsersService,
  ) {}

  async order(dto: OrderDto) {
    const orders = await this.saveOrderMany(dto.orders);
    console.log(orders);
    const result = { phone: dto.phone, name: dto.name, orders };
    const savedOrder = await this.ordersRepo.save(result);
    const items = [];
    const text = `Заказ #${savedOrder.id}\nИмя: ${savedOrder.name}\nТелефон: ${savedOrder.phone}\n\n`;
    let sum = 0;
    const addParams = savedOrder.orders.map((e) => {
      const onePrice = Math.round(Number(e.offer.price));
      const price = onePrice * e.count;
      items.push({
        quantity: e.count,
        initialPrice: onePrice,
        productName: e.offer.name,
        offer: { externalId: e.offer.id },
      });
      sum += price;
      const params = e.offer.params.map((e) => {
        return `${e.name}: ${e.text}`;
      });
      return `Товар: ${e.offer.name}\n${params.join('\n')}\nКоличество: ${
        e.count
      } шт.\nСумма: ${price} руб.`;
    });
    const resultDict = {
      firstName: savedOrder.name,
      phone: savedOrder.phone,
      items,
    };
    axios({
      url: `https://${process.env.RETAIL_DOMEN}/api/v5/orders/create?apiKey=${process.env.RETAIL_TOKEN}`,
      method: 'post',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `order=${JSON.stringify(resultDict)}`,
    }).then((e) => console.log(e.data.order.items));
    const user = await this.usersService.getUserByTelegramId(process.env.ADMIN);
    if (user?.notice) {
      await this.telegraf.telegram.sendMessage(
        process.env.ADMIN,
        `${text}${addParams.join('\n\n')}\n\nИтого: ${sum} руб.`,
      );
    }
    return savedOrder;
  }

  async saveOrderMany(orders: orderOne[]) {
    return await Promise.all(
      orders.map(async (e) => {
        const offer = await this.offersService.getByOfferId(e.offerId, {
          relations: ['params'],
        });
        return { offer, count: e.count };
      }),
    );
  }
}
