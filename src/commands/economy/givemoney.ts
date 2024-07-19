import { Args, Command } from '@sapphire/framework';
import { type Message } from 'discord.js';
import { getGuild } from '../../services/economy/guild';
import { getMember } from '../../services/economy/member';
import { getUser } from '../../services/economy/user';
import { colors, DefaultEmbed, ErrorEmbed, LoadingEmbed } from '../../lib/embeds';
import { prisma } from '../../lib/prisma';
import { Transaction } from '@prisma/client';
import { log } from '../../services/economy/log';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
	aliases: ['givemoney', 'give', 'send', 'reward'],
	description: 'Give money to someone!',
	detailedDescription:
		'This command is used to `give` money to someone only if you are an admin. The money will magically appear in the economy out of nowhere!',
	requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
	requiredUserPermissions: ['ViewChannel', 'SendMessages', 'ModerateMembers', 'UseApplicationCommands'],
	runIn: ['GUILD_ANY']
})
export class GiveMoneyCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		if (message.author.bot) return;
		if (!message.inGuild()) return;

		const recipient = await args.pick('member').catch(() => null);
		let amount = await args.pick('number').catch(() => null);
		const remark = await args.rest('string').catch(() => null);

		if (!recipient || !amount || !remark) {
			await message.reply({
				embeds: [new ErrorEmbed(message, `Missing Arguments: ${!recipient ? 'Recipient' : !amount ? 'Amount' : 'Remark'}`)]
			});
			return;
		}

		amount = Math.abs(amount);

		const loading = await message.reply({
			embeds: [new LoadingEmbed(message, 'Rewarding')]
		});

		const guild = await getGuild(message.guildId);
		const user = await getUser(message.author.id);
		const member = await getMember(user, guild);

		const txn: Transaction = {
			amount,
			remark,
			date: new Date(),
			actor: message.author.id
		};

		await prisma.member.update({
			where: {
				id: member.id
			},
			data: {
				wallet: {
					update: {
						amount: {
							increment: amount
						}
					}
				},
				txn: {
					push: [txn]
				}
			}
		});

		if (guild.economy.log.channel) {
			await log(recipient.user, message.guild, guild.economy.log.channel, txn, member.wallet.amount);
		}

		const embed = new DefaultEmbed(message)
			.setTitle(`Rewarding ${recipient.displayName} with ${amount.toFixed(2)} coins`)
			.setDescription(`Operation strix: ${remark}`)
			.addFields([
				{
					name: 'New Balance',
					value: `${member.wallet.amount + amount} coins`
				}
			])
			.setAuthor({
				name: recipient.displayName,
				iconURL: recipient.displayAvatarURL()
			})
			.setColor(colors.green);

		await message.reply({ embeds: [embed] });

		await loading.delete();
	}
}
