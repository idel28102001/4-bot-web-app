import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';
import { GoodsService } from '../../goods/services/goods.service';

@Wizard('import-yml')
export class ImportYmlWizard {
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
      `Пришлите ссылку на каталог в формате YML. При импорте нового каталога старые товары будут удалены. Пришлите /exit чтобы выйти`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const text = (ctx as any).update.message.text;
    if (text === '/exit') {
      ctx.scene.leave();
      return;
    }
    const link = result.message.text.trim();
    const res = (await ctx.reply('Загрузка...')) as any;
    await this.goodsService.downloadYml(link);
    await (ctx as any).telegram.editMessageText(
      res.chat.id,
      res.message_id,
      '',
      'Готово',
    );
    ctx.scene.leave();
  }
}
