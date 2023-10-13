/* eslint-disable */
import { Command } from '@sapphire/framework'
import { Message } from 'discord.js'

export class CountdownCommand extends Command {
  constructor (context: Command.Context) {
    super(context, {
      aliases: ['countdown', 'when', 'dates'],
      description: "Count down to HTM 4",
      requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
      requiredUserPermissions: ['ViewChannel', 'SendMessages']
    })
  }

  public async messageRun (message: Message) {
    message.reply('HTM is <t:1698441420:R>')
  }
}
