import { Command } from '@sapphire/framework';
import { type Message } from 'discord.js';
import { getGuild } from '../../services/economy/guild';
import { ApplyOptions } from '@sapphire/decorators';
import { prisma } from '../../lib/prisma';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { colors, DefaultEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
	aliases: ['leaderboard', 'lb', 'top'],
	description: 'Check the leaderboard!',
	detailedDescription: 'This command is used to `check` the leaderboard (available to everyone).',
	requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
	requiredUserPermissions: ['ViewChannel', 'SendMessages', 'UseApplicationCommands'],
	runIn: ['GUILD_ANY']
})
export class WalletCommand extends Command {
	public override async messageRun(message: Message) {
		const guild = await getGuild(message.guildId!);

		const members = await prisma.member.findMany({
			where: {
				guildId: guild.id
			},
			orderBy: {
				wallet: {
					amount: 'desc'
				}
			},
			take: 50
		});

		const leaderboard = new PaginatedMessage({
			template: new DefaultEmbed(message).setColor(colors.green)
		}).addPageBuilder((builder) => {
			return builder.setAllowedMentions({ repliedUser: true, users: [], roles: [] }).setEmbeds([
				new DefaultEmbed(message).setTitle('Leaderboard').addFields(
					members
						.map((member, index) => ({
							name: `${index + 1}.`,
							value: `<@${member.userId}> (${member.wallet.amount} 💰)`
						}))
						.sort((a, b) => parseInt(b.value.split(' ')[1]) - parseInt(a.value.split(' ')[1]))
				)
			]);
		});

		await leaderboard.run(message);
	}
}
