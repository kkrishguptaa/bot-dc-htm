import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import { p } from '../../lib/prisma/client';

@ApplyOptions<Command.Options>({
	aliases: ['leaderboard', 'top', 'richest', 'rich', 'richies', 'scroogemcducks', 'batmans', 'tonystarks', 'billionaires', 'millionaires'],
	description: "Checks the bot's ping to the Discord server.",
	detailedDescription:
		"Calculates the bot's ping to the discord server using the websocket connection ping and the time to round trip of editing an message.",
	requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
	requiredUserPermissions: ['ViewChannel', 'SendMessages', 'UseApplicationCommands']
})
export class LeaderboardCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guildId) {
			return message.reply('Please run this in a guild :/');
		}

		const wallets = await p.member.findMany({
			where: {
				guildId: message.guildId
			}
		});

		const top10 = wallets.sort((a, b) => b.money - a.money).splice(0, 10);

		const leaderboardFields = top10.map((v) => {
			return `<@${v.userId}>    ${v.money}`;
		});

		return await message.reply({
			embeds: [
				new EmbedBuilder({
					title: `Leaderboard of ${message.guild?.name}`,
					description: leaderboardFields.join('\n')
				}).setColor('#EB459E')
			]
		})
	}
}
