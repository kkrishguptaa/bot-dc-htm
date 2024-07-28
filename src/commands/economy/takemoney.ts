import { Args, Command } from '@sapphire/framework';
import { type Message } from 'discord.js';
import { getGuild } from '../../services/economy/guild';
import { getMember } from '../../services/economy/member';
import { getUser } from '../../services/economy/user';
import { colors, DefaultEmbed, ErrorEmbed, LoadingEmbed } from '../../lib/embeds';
import { prisma } from '../../lib/prisma';
import { Transaction } from '@prisma/client';
import { log } from '../../services/economy/log';

export class GiveMoneyCommand extends Command {
	constructor(context: Command.LoaderContext) {
		super(context, {
			aliases: ['takemoney', 'take', 'punish'],
			description: 'Take money from someone!',
			detailedDescription:
				'This command is used to `take` money to someone only if you are an admin. The money will magically disappear from the economy out of nowhere!',
			requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
			requiredUserPermissions: ['ViewChannel', 'SendMessages', 'ModerateMembers', 'UseApplicationCommands'],
			runIn: ['GUILD_ANY']
		});
	}

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

		amount = Math.abs(amount) * -1;

		const loading = await message.reply({
			embeds: [new LoadingEmbed(message, 'Deducting')]
		});

		const guild = await getGuild(message.guildId);
		const user = await getUser(recipient.id);
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
							decrement: Math.abs(amount)
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
			.setTitle(`Deducting ${Math.abs(amount).toPrecision(2)} from ${recipient.displayName}`)
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
			.setColor(colors.red);

		await message.reply({ embeds: [embed] });

		await loading.delete();
	}
}
