import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';
import { CURRS, SOURCE } from '../../common/constants';

@Wizard('notice')
export class NoticeWizard {
  constructor(private readonly usersService: UsersService) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const cntx = ctx as any;
    const answer = cntx.update.callback_query?.data;
    if (['Yes', 'No'].includes(answer)) {
      await this.deleteMessage(ctx);
      const user = await this.usersService.getUserByTelegramId(
        cntx.update.callback_query.from.id,
        ctx,
      );
      switch (answer) {
        case 'Yes': {
          user.notice = !user.notice;
          await this.usersService.save(user);
          await ctx.reply('Параметры внесены');
          break;
        }
        case 'No': {
          await ctx.reply('Параметры не изменены');
          break;
        }
      }
      ctx.scene.leave();
      return;
    }
    const notice = cntx.session.notice;
    await this.deleteMessage(ctx);
    const text = notice ? 'Отключить' : 'Включить';
    await ctx.reply(`${text} уведомления?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Да', callback_data: 'Yes' },
            { text: 'Нет', callback_data: 'No' },
          ],
        ],
      },
    });
  }
}
