import { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { Collection, type Message } from 'discord.js';
import { getGuild } from '../../services/economy/guild';
import { getUser } from '../../services/economy/user';
import { getMember } from '../../services/economy/member';
import { RateLimitManager } from '@sapphire/ratelimits';
import { sample } from 'lodash';
import { prisma } from '../../lib/prisma';
import { getAuthorInfo, getGuildInfo } from '../../lib/utils';
import { Transaction } from '@prisma/client';
import { log } from '../../services/economy/log';
import { ApplyOptions } from '@sapphire/decorators';

const ratelimitManagers = new Collection<string, RateLimitManager>();

@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate
})
export class MessageRewardEvent extends Listener<typeof Events.MessageCreate> {
	public override async run(message: Message) {
		if (message.content.startsWith('!')) return;
		if (message.author.bot) return;
		if (!message.inGuild()) return;

		const guild = await getGuild(message.guildId);

		const user = await getUser(message.author.id);
		const member = await getMember(user, guild);

		const cooldown = guild.economy.cooldowns.message;

		if (!ratelimitManagers.has(message.guildId)) {
			ratelimitManagers.set(message.guildId, new RateLimitManager(cooldown * 1000));
		}

		const ratelimitManager = ratelimitManagers.get(message.guildId)!;
		const ratelimit = ratelimitManager.acquire(message.author.id);

		if (ratelimit.limited) return;

		const reward = sample(guild.economy.rewards.message) ?? Math.min(...guild.economy.rewards.message);

		const txn: Transaction = {
			amount: reward,
			remark: null,
			date: new Date(),
			actor: null
		};

		await prisma.member.update({
			where: { id: member.id },
			data: {
				wallet: {
					update: {
						amount: {
							increment: reward
						}
					}
				},
				txn: {
					push: [txn]
				}
			}
		});

		if (guild.economy.log.channel) {
			log(message.author, message.guild, guild.economy.log.channel, txn, member.wallet.amount);
		}

		this.container.logger.info(
			`${getAuthorInfo(message.author)} has been rewarded ${reward} for sending a message in ${getGuildInfo(message.guild)}`
		);

		ratelimit.consume();
	}
}
