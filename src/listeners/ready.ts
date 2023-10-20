/* eslint-disable */
import { Listener } from '@sapphire/framework'
import { bgMagenta, bold } from 'colorette'
import { ActivityType } from 'discord.js'

export class UserEvent extends Listener {

  constructor (context: Listener.Context) {
    super(context, {
      once: true,
      event: 'ready'
    })
  }

  public run () {
    this.container.client.user?.setStatus('idle')
    this.container.client.user?.setActivity({
      name: 'HTM4 Registrations Skyrocket',
      type: ActivityType.Watching,
      url: 'https://hackthemountain.tech'
    })
    this.container.logger.info(bgMagenta(bold('Discord Service')))
    this.container.logger.info(bgMagenta(`Power Level: ${bold('OVER 9000')}`))
  }
}
