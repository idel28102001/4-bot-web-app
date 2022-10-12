import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { GoodsService } from '../services/goods.service';
import { Headers, ParseIntPipe } from '@nestjs/common';

@Controller('table')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Get()
  @Header('Content-Type', 'text/xml')
  async getTable() {
    return await this.goodsService.getMarket();
  }

  @Get('json')
  async getTableJson(@Query() query) {
    return await this.goodsService.getShortGoods(query);
  }

  @Get('csv/json')
  async getTableJsonCSV(@Query() query) {
    return await this.goodsService.getShortGoodsCSV(query);
  }

  @Get('csv/json/:id')
  async getOneCSVItem(@Param('id', ParseIntPipe) id: number) {
    return await this.goodsService.CSVGood(id);
  }

  @Get('categories')
  async getCategories() {
    return await this.goodsService.getCategories();
  }

  @Get('categories/:id')
  async getGoodsByCategory(@Param() { id }, @Query() query) {
    return await this.goodsService.getGoodsByCategory(id, query);
  }

  @Get('json/:id')
  async getElemById(@Param() param) {
    return await this.goodsService.getById(param.id);
  }
}
