import { Module } from '@nestjs/common';
import { GoodsService } from './services/goods.service';
import { GoodsController } from './controllers/goods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './services/categories.service';
import { CategoriesEntity } from './entities/categories.entity';
import { CurrenciesEntity } from './entities/currencies.entity';
import { ParamsEntity } from './entities/params.entity';
import { OffersEntity } from './entities/offers.entity';
import { MarketsEntity } from './entities/markets.entity';
import { CurrenciesService } from './services/currencies.service';
import { ParamsService } from './services/params.service';
import { OffersService } from './services/offers.service';
import { GroupsService } from './services/groups.service';
import { GroupsEntity } from './entities/groups.entity';
import { MarketsService } from './services/markets.service';
import { UtilsService } from './services/utils.service';
import { GoodsEntity } from './entities/goods.entity';
import { GoodService } from './services/good.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoriesEntity,
      CurrenciesEntity,
      ParamsEntity,
      OffersEntity,
      MarketsEntity,
      GroupsEntity,
      GoodsEntity,
    ]),
  ],
  providers: [
    GoodsService,
    CategoriesService,
    CurrenciesService,
    ParamsService,
    OffersService,
    GroupsService,
    MarketsService,
    UtilsService,
    GoodService,
  ],
  controllers: [GoodsController],
  exports: [
    GoodsService,
    CurrenciesService,
    ParamsService,
    OffersService,
    GroupsService,
    CategoriesService,
    MarketsService,
    UtilsService,
    GoodService,
  ],
})
export class GoodsModule {}
