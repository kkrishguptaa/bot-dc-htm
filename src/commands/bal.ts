import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { p } from '../lib/prisma';
import type { User } from '@prisma/client';

@ApplyOptions<Command.Options>({
	description: 'CRUD Applications On User\'s Balance'
})
export class UserCommand extends Command {
	// Message command
	public async messageRun(message: Message) {
		return this.sendBalance(message);
	}

	private async sendBalance(message: Message) {
		const userExists = (await p.user.findUnique({
      where: {
        id: message.author.id
      }
    }))

    let user: User;

    if (userExists) {
      user = userExists
    } else {
      user = await p.user.create({
        data: {
          id: message.author.id
        }
      })
    }

    const balance = user?.balance

    message.reply(`You have ${balance} in your wallet!`)
	}
}
