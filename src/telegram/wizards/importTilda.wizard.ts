import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';
import { GoodsService } from '../../goods/services/goods.service';

@Wizard('import-tilda')
export class ImportTildaWizard {
  constructor(
    private readonly usersService: UsersService,
    private readonly goodsService: GoodsService,
  ) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await this.deleteMessage(ctx);
    await ctx.reply(
      `Отправьте файл в формате csv. При импорте нового каталога старые товары будут удалены. Пришлите /exit чтобы выйти`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const doc = (ctx as any).update.message.document?.file_id;
    const text = (ctx as any).update.message.text;
    if (text === '/exit') {
      ctx.scene.leave();
      return;
    }
    if (!doc) {
      await ctx.reply('Ошибка. Пришлите файл');
      await ctx.wizard.selectStep(2);
      return;
    }
    const res = (await ctx.reply('Загрузка...')) as any;
    const link = (await ctx.telegram.getFileLink(doc)).href;
    await this.goodsService.downloadTilda(link);
    await (ctx as any).telegram.editMessageText(
      res.chat.id,
      res.message_id,
      '',
      'Готово',
    );
    ctx.scene.leave();
  }
}
