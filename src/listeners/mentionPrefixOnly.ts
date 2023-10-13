import type { Events } from '@sapphire/framework'
import { Listener } from '@sapphire/framework'
import type { Message } from 'discord.js'

export class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
  public async run (message: Message): Promise<Message<boolean>> {
    const prefix = await this.container.client.options.fetchPrefix?.(message) ?? this.container.client.options.defaultPrefix
    return await message.reply((prefix !== undefined) ? `Dattebayo! My ninja way ||(prefix)|| in this guild is: **${prefix?.toString()}**` : 'I\'m still searching for my ninja way, can\'t find any Prefix for Message Commands. 🍥🍃')
  }
}
