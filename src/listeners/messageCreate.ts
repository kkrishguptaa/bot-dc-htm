import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { p } from '../lib/prisma';
import { economyLogChannelId } from '../lib/constants';

const cooldown: Set<string> = new Set();

@ApplyOptions<Listener.Options>({ event: 'messageCreate' })
export class MessageCreateEvent extends Listener {

	public async run(message: Message) {
    if (message.content.startsWith('!')) return;
    if (message.author.bot) return;
    if (!message.member) return;

    const member = message.member;

    if (cooldown.has(member.id)) {
      console.log(`${member.displayName} messaged, but they were on a cooldown`)

      return;
    }

    cooldown.add(member.id)

    console.log(`${member.displayName} has been added to cooldown`)

    const increment = [3, 4, 5][Math.floor(Math.random() * 2)]

    const user = await p.user.upsert({
      create: {
        id: member.id,
        balance: increment
      },
      update: {
        balance: {
          increment
        }
      },
      where: {
        id: member.id
      }
    })

    console.log(`${member.displayName} messaged! They received ${increment}, they now have ${user.balance}`)

    setTimeout(() => {
      cooldown.delete(member.id)

      console.log(`${member.displayName}'s cooldown has expired!`)
    }, 5 * 60 * 100)

    const channels = await message.guild?.channels.fetch()

    const logChannel = await (channels?.find((c) => c?.id === economyLogChannelId)?.fetch())

    if (logChannel?.isTextBased()) {
      logChannel.send(`Added ${increment} to <@${member.id}>'s balance, they now have ${user.balance}`)
    }
	}
}
