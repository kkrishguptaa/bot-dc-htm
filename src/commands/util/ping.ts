import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ApplicationCommandType, EmbedBuilder, InteractionResponse, Message } from 'discord.js';
import { oneLine } from 'common-tags';
import { isMessageInstance } from '@sapphire/discord.js-utilities';

@ApplyOptions<Command.Options>({
	aliases: ['ping', 'pong'],
	description: "Checks the bot's ping to the Discord server.",
	detailedDescription:
		"Calculates the bot's ping to the discord server using the websocket connection ping and the time to round trip of editing an message.",
	requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
	requiredUserPermissions: ['ViewChannel', 'SendMessages', 'UseApplicationCommands']
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));

		registry.registerContextMenuCommand((builder) => builder.setName('Check Ping').setType(ApplicationCommandType.Message));
	}

	public async messageRun(message: Message) {
		const { loadingEmbed, pingedEmbed } = this.embeds();

		const loading = await message.reply({
			embeds: [loadingEmbed]
		});

		loading.edit({
			embeds: [pingedEmbed(loading)]
		});
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { loadingEmbed, pingedEmbed, errorEmbed } = this.embeds();

		const loading = await interaction.reply({
			embeds: [loadingEmbed],
			ephemeral: true,
			fetchReply: true
		});

		if (isMessageInstance(loading)) {
			return interaction.editReply({
				embeds: [pingedEmbed(loading)]
			});
		}

		return interaction.editReply({
			embeds: [errorEmbed]
		});
	}

	public async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		const { loadingEmbed, pingedEmbed, errorEmbed } = this.embeds();

		const loading = await interaction.reply({
			embeds: [loadingEmbed],
			ephemeral: true,
			fetchReply: true
		});

		if (isMessageInstance(loading)) {
			return interaction.editReply({
				embeds: [pingedEmbed(loading)]
			});
		}

		return interaction.editReply({
			embeds: [errorEmbed]
		});
	}

	private embeds() {
		const loadingEmbed = new EmbedBuilder({
			title: '🔂 Pinging...'
		}).setColor('#FEE75C');

		const pingedEmbed = (loading: Message | InteractionResponse) => {
			return new EmbedBuilder({
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
			}).setColor('#57F287');
		};

		const errorEmbed = new EmbedBuilder({
			title: '⚠️ Error',
			description: 'An expected error has occured please contact user: `xkrishguptaa` for support'
		}).setColor('#ED4245');

		return {
			loadingEmbed,
			pingedEmbed,
			errorEmbed
		};
	}
}
