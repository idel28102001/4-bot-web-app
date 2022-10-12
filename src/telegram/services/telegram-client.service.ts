import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { UsersService } from '../../users/services/users.service';
import { RoleEnum } from '../../users/enums/Role.enum';
import { MarketsService } from '../../goods/services/markets.service';

@Injectable()
export class TelegramClientService {
  constructor(
    private readonly userService: UsersService,
    private readonly marketsService: MarketsService,
  ) {}

  async checkRole(array, role, ctx) {
    if (!array.includes(role)) {
      await ctx.reply('У вас нет прав на данное действие');
      return false;
    }
    return true;
  }

  async sendMenu(ctx: Context) {
    const cntx = ctx as any;
    const { username } = cntx.update.message.from;
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      await ctx.reply('Вас нет в базе, отправьте /start для добавления в базу');
      return;
    }
    switch (user.role) {
      case RoleEnum.ADMIN: {
        await this.adminKeyboard(ctx);
        return;
      }
    }
    await ctx.reply('У вас нет прав на админку');
  }

  async adminKeyboard(ctx: Context) {
    const telegId = (ctx as any).update.message.from.id;
    const { notice } = await this.userService.getUserByTelegramId(telegId, ctx);
    (ctx as any).session.notice = notice;
    const text = notice ? 'включено' : 'выключено';
    await ctx.reply('Меню администратора', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Импорт YML', callback_data: 'import' },
            {
              text: 'Экспорт YML',
              callback_data: 'export',
            },
          ],
          [{ text: 'Импорт Tilda CSV каталога', callback_data: 'importTilda' }],
          [{ text: `Уведомление(${text})`, callback_data: 'notice' }],
        ],
      },
    });
  }

  async sendExportLink(ctx: Context) {
    try {
      await ctx.deleteMessage();
    } catch (e) {}
    if (process.env.WEBSITE_DOMEN) {
      try {
        await ctx.reply('Ссылка', {
          entities: [
            {
              offset: 0,
              length: 6,
              url: `https://${process.env.WEBSITE_DOMEN}/api/table`,
              type: 'text_link',
            },
          ],
        });
      } catch (e) {
        await ctx.reply(
          'Ошибка, перепроверьте ваш домен. Он не должен включать в себя https:// конструкцию, так она изначально прописывается в коде',
        );
      }
    } else {
      await ctx.reply(
        'У вас не указан домен на переменной WEBSITE_DOMEN в env файле',
      );
    }
  }

  async notice(ctx: Context) {
    await (ctx as any).scene.enter('notice');
  }

  async message(ctx: Context) {
    const result = (ctx as any).update.message.text;
    const from = (ctx as any).update.message.chat.id;
    const user = await this.userService.getUserByTelegramId(from, ctx);
    switch (result) {
      case '/addrow': {
        const check = await this.checkRole(
          ['EMPLOYEE', 'ADMIN'],
          user.role,
          ctx,
        );
        if (check) {
          await this.addRow(ctx);
        }
        return;
      }
      case '/deleterow': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.deleteRow(ctx);
        }
        return;
      }
      case '/addemployee': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.addEmployee(ctx, 'empl');
        }
        return;
      }
      case '/deleteemployee': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.addEmployee(ctx, 'user');
        }
        return;
      }

      case '/adddir': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.addEmployee(ctx, 'dir');
        }
        return;
      }
    }
  }

  async deleteRow(ctx: Context) {
    const cntx = ctx as any;
    await cntx.scene.enter('delete-row');
  }

  async addEmployee(ctx: Context, add: string) {
    const cntx = ctx as any;
    cntx.session.add = add;
    await cntx.scene.enter('add-employee');
  }

  async addRow(ctx: Context) {
    const cntx = ctx as any;
    await cntx.scene.enter('add-row');
  }
}
