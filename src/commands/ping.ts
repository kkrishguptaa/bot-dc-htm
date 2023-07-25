import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Ping Pong'
})
export class UserCommand extends Command {
	// Message command
	public async messageRun(message: Message) {
		return this.sendPing(message);
	}

	private async sendPing(message: Message) {
		const pingMessage = await message.channel.send({ content: 'Ping?' })

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			pingMessage.createdTimestamp - message.createdTimestamp
		}ms.`;

		if (message instanceof Message) {
			return pingMessage.edit({ content });
		}

		return pingMessage.edit({
			content: content
		});
	}
}
