import { Transaction } from '@prisma/client';
import { EmbedBuilder, Guild, User } from 'discord.js';
import { prisma } from '../../lib/prisma';
import { colors } from '../../lib/embeds';

export async function log(user: User, guild: Guild, channelId: string, txn: Transaction, prevAmount: number) {
	const channel = await guild.channels.fetch(channelId);

	if (!channel || channel.isTextBased() === false) {
		await prisma.guild.update({
			where: { id: guild.id },
			data: {
				economy: {
					update: {
						log: {
							set: {
								channel: undefined
							}
						}
					}
				}
			}
		});

		return;
	}

	const embed = new EmbedBuilder()
		.setTimestamp()
		.setColor(txn.amount > 0 ? colors.green : colors.red)
		.setAuthor({
			name: user.displayName,
			iconURL: user.displayAvatarURL()
		})
		.setDescription(txn.remark)
		.addFields([
			{
				name: 'Modification',
				value: txn.amount.toPrecision(),
				inline: true
			},
			{
				name: 'Updated Balance',
				value: `${prevAmount + txn.amount} coins`,
				inline: true
			},
			{
				name: 'Actor',
				value: txn.actor ? `<@${txn.actor}>` : 'System',
				inline: true
			},
			{
				name: 'Date',
				value: `<t:${Math.floor(txn.date.getTime() / 1000)}:F>`
			}
		])
		.setFooter({
			text: `User ID: ${user.id} | Guild ID: ${guild.id}`
		})
		.setTitle(`${user.displayName} has ${txn.amount > 0 ? 'received' : 'lost'} ${Math.abs(txn.amount).toPrecision()} coins`);

	await channel.send({ embeds: [embed] });
}
