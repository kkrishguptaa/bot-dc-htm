/* eslint-disable */
import { Listener } from '@sapphire/framework'
import type { Events, MessageCommandDeniedPayload, UserError } from '@sapphire/framework'

export class UserEvent extends Listener<typeof Events.MessageCommandDenied> {
  public async run ({ context, message: content }: UserError, { message }: MessageCommandDeniedPayload) {
    // `context: { silent: true }` should make UserError silent:
    // Use cases for this are for example permissions error when running the `eval` command.
    if (Reflect.get(Object(context), 'silent')) return

    return await message.reply({ content, allowedMentions: { users: [message.author.id], roles: [] } })
  }
}
