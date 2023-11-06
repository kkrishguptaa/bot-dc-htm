import { container } from '@sapphire/framework'
import { EmbedBuilder } from 'discord.js'
import type { Interaction, Message } from 'discord.js'

export function defaultEmbed (message: Message | Interaction): EmbedBuilder {
  const client = container.client
  const member = message.member

  return new EmbedBuilder().setAuthor({
    name: client?.user?.displayName ?? '',
    iconURL: client?.user?.displayAvatarURL()
  }).setFooter({
    text: member?.user.username ?? '',
    iconURL: member?.user?.banner ?? ''
  })
}
