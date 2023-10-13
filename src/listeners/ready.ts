/* eslint-disable */
import { Listener } from '@sapphire/framework'
import { bgMagenta, bold } from 'colorette'

export class UserEvent extends Listener {

  constructor (context: Listener.Context) {
    super(context, {
      once: true,
      event: 'ready'
    })
  }

  public run () {
    this.container.logger.info(bgMagenta(bold('Discord Service')))
    this.container.logger.info(bgMagenta(`Power Level: ${bold('OVER 9000')}`))
  }
}
