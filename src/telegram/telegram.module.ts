import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { TelegramUpdate } from './update/telegram.update';
import { TelegramMainService } from './services/telegram-main.service';
import { TelegramClientService } from './services/telegram-client.service';
import { GoodsModule } from '../goods/goods.module';

@Module({
  imports: [UsersModule, GoodsModule],
  providers: [TelegramUpdate, TelegramMainService, TelegramClientService],
})
export class TelegramModule {}
