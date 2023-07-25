import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { GuildMember, Message } from 'discord.js';
import { p } from '../lib/prisma';
import { economyLogChannelId } from '../lib/constants';

@ApplyOptions<Command.Options>({
	description: '',
  requiredUserPermissions: ['BanMembers']
})
export class AddBalanceCommand extends Command {
	// Message command
	public async messageRun(message: Message, args: Args) {
		return this.sendBalance(message, await args.pick('member'), await args.pick('number'));
	}

	private async sendBalance(message: Message, member: GuildMember, amount: number) {
		const user = await p.user.upsert({
      create: {
        id: member.id,
        balance: amount
      },
      update: {
        balance: {
          increment: amount
        }
      },
      where: {
        id: member.id
      }
    })

    message.reply(`Added ${amount} to <@${member.id}>'s balance, they now have ${user.balance}`)

    const channels = await message.guild?.channels.fetch()

    const logChannel = await (channels?.find((c) => c?.id === economyLogChannelId)?.fetch())

    if (logChannel?.isTextBased()) {
      logChannel.send(`Added ${amount} to <@${member.id}>'s balance, they now have ${user.balance}`)
    }
	}
}
