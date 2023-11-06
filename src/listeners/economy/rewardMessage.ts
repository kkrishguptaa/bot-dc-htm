/* eslint-disable */
import { Listener, container } from '@sapphire/framework'
import { type Message } from 'discord.js'
import { cyan } from 'colorette'
import { getGuildWalletManager } from '../../lib/prisma/wallet'
import { walletConf } from '../../lib/config'

const cooldowns = new Set<string>()

export class RewardMoneyOnMessage extends Listener {
  constructor (context: Listener.Context) {
    super(context, {
      once: false,
      event: 'messageCreate'
    })
  }

  public async run (message: Message) {
    if (message.content.startsWith('!')) return
    if (message.author.bot) return
    if (walletConf.blockedChannels?.includes(message.channelId)) return
    if (!message.member) return

    const member = message.member

    if (cooldowns.has(member.id)) {
      container.logger.debug(`${cyan(member.user.username)} messaged, but they were on a cooldown`); return
    } else {
      cooldowns.add(member.id)

      container.logger.debug(`${cyan(member.user.username)} has been added to cooldown`)
    }

    const wallet = getGuildWalletManager(member, member.guild)

    const increment = parseInt(new String((walletConf.onMessageMoney.amount ?? [3, 4, 5])[Math.floor(Math.random() * ((walletConf.onMessageMoney.amount?.length ?? 3) - 1))]).toString())

    await wallet.update({
      increment
    }, container.client.user!)

    const currentBalance = (await wallet.read()).money

    container.logger.debug(
			`${cyan(member.user.username)} messaged! They received ${increment}, they now have ${currentBalance}`
    )

    setTimeout(
      () => {
        cooldowns.delete(member.id)

        container.logger.debug(`${cyan(member.user.username)}'s cooldown has expired!`)
      },
      parseInt(walletConf.onMessageMoney.cooldown ?? '3') * 60 * 1000
    )
  }
}
