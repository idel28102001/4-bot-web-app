import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './common/config';
import { TelegramModule } from './telegram/telegram.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { UsersModule } from './users/users.module';
import { NoticeWizard } from './telegram/wizards/notice.wizard';
import { ImportYmlWizard } from './telegram/wizards/import-yml.wizard';
import { AddEmployeeWizard } from './telegram/wizards/addEmployee.wizard';
import { ImportTildaWizard } from './telegram/wizards/importTilda.wizard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GoodsModule } from './goods/goods.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => config.getDatabaseOptions(),
    }),
    TelegramModule,
    TelegrafModule.forRootAsync({
      useFactory: () => {
        return {
          token: config.telegramToken(),
          middlewares: [session()],
        };
      },
    }),
    UsersModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../src', 'views'),
      exclude: ['/api/*', '/js/*', '/images/*', '/css/*', '/fonts/*'],
    }),
    GoodsModule,
    OrdersModule,
  ],
  providers: [
    NoticeWizard,
    ImportYmlWizard,
    AddEmployeeWizard,
    ImportTildaWizard,
  ],
})
export class AppModule {}
