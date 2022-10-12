import { Body, Controller, Post } from '@nestjs/common';
import { OrderDto } from '../dtos/order.dto';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async addOrder(@Body() dto: OrderDto) {
    return await this.ordersService.order(dto);
  }
}
