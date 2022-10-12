import { Action, Command, Hears, On, Start, Update } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { TelegramClientService } from '../services/telegram-client.service';
import { TelegramMainService } from '../services/telegram-main.service';
import { GoodsService } from '../../goods/services/goods.service';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramMainService: TelegramMainService,
    private readonly telegramClientService: TelegramClientService,
    private readonly goodsService: GoodsService,
  ) {}

  @Start()
  async startCommand(ctx: any) {
    const { id, first_name, last_name, username } = ctx.update.message.from;
    await this.usersService.register({
      telegramId: id,
      firstname: first_name,
      lastname: last_name,
      username,
    });
    await ctx.reply('Начало положено');
  }

  @Command('/menu')
  async menu(ctx: Context) {
    return await this.telegramClientService.sendMenu(ctx);
  }

  @Action('import')
  async import(ctx: any) {
    await ctx.scene.enter('import-yml');
  }

  @Action('importTilda')
  async importTilda(ctx: any) {
    await ctx.scene.enter('import-tilda');
  }

  @Action('export')
  async export(ctx: any) {
    await this.telegramClientService.sendExportLink(ctx);
  }

  @Action('notice')
  async notice(ctx: any) {
    await this.telegramClientService.notice(ctx);
  }
}
