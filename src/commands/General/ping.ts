import { Interaction } from 'discord.js';
import { Command } from '@sapphire/framework';
import { type InteractionResponse, type Message } from 'discord.js';
import { oneLine } from 'common-tags';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { colors, DefaultEmbed, ErrorEmbed, LoadingEmbed } from '../../lib/embeds';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
	aliases: ['ping', 'pong', 'tip', 'tap'],
	description: "Checks the bot's ping to the Discord server.",
	detailedDescription:
		"Calculates the bot's ping to the discord server using the websocket connection ping and the time to round trip of editing an message.",
	requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
	requiredUserPermissions: ['ViewChannel', 'SendMessages', 'UseApplicationCommands']
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public override async messageRun(message: Message) {
		const loading = await message.reply({
			embeds: [new LoadingEmbed(message, 'Pinging')]
		});

		loading.edit({
			embeds: [this.ping(message, loading)]
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const loading = await interaction.reply({
			embeds: [new LoadingEmbed(interaction, 'Pinging')],
			ephemeral: true,
			fetchReply: true
		});

		if (isMessageInstance(loading)) {
			return await interaction.editReply({
				embeds: [this.ping(interaction, loading)]
			});
		}

		return await interaction.editReply({
			embeds: [new ErrorEmbed(interaction)]
		});
	}

	private ping(command: Message | Interaction | Command.ContextMenuCommandInteraction, loading: Message | InteractionResponse) {
		return new DefaultEmbed(command, {
			title: '✅ Pinged',
			description: "Pong! Here's the details:",
			fields: [
				{
					name: 'Message Round Trip',
					value: oneLine`${loading.createdTimestamp - loading.createdTimestamp}ms.`,
					inline: true
				},
				{ name: 'Hearbeat Ping', value: `${Math.round(this.container.client.ws.ping)}ms.`, inline: true }
			]
		}).setColor(colors.green);
	}
}
