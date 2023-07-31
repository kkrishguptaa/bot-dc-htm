import { ApplyOptions } from '@sapphire/decorators';
import { Listener, container } from '@sapphire/framework';
import { Message } from 'discord.js';
import { cyan } from 'colorette';
import { getGuildWalletManager } from '../../lib/prisma/wallet';
import { walletConf } from '../../lib/config';

const cooldowns: Set<string> = new Set();

@ApplyOptions<Listener.Options>({ event: 'messageCreate' })
export class RewardMoneyOnMessage extends Listener {
	public async run(message: Message) {
		if (message.content.startsWith('!')) return;
		if (message.author.bot) return;
		if (!message.member) return;

		const member = message.member;

		if (cooldowns.has(member.id)) {
			return container.logger.debug(`${member.user.username}${cyan(member.user.tag)} messaged, but they were on a cooldown`);
		} else {
			cooldowns.add(member.id);

			container.logger.debug(`${member.user.username}${cyan(member.user.tag)} has been added to cooldown`);
		}

		const wallet = getGuildWalletManager(member, member.guild);

		const increment = parseInt(new String((walletConf.onMessageMoney.amount ?? [3,4,5])[Math.floor(Math.random() * ((walletConf.onMessageMoney.amount?.length ?? 3) - 1))]).toString())

		await wallet.update({
			increment: increment
		});

		const currentBalance = (await wallet.read()).money;

		container.logger.debug(
			`${member.user.username}${cyan(member.user.tag)} messaged! They received ${increment}, they now have ${currentBalance}`
		);

		setTimeout(
			() => {
				cooldowns.delete(member.id);

				container.logger.debug(`${member.user.username}${cyan(member.user.tag)}'s cooldown has expired!`);
			},
			parseInt(walletConf.onMessageMoney.cooldown ?? '3') * 60 * 1000
		);
	}
}
