import { Collection, EmbedBuilder, type GuildMember as DiscordGuildMember, Guild, User } from 'discord.js';
import { Prisma, type Member as DatabaseGuildMember } from '@prisma/client';
import { p } from './client';
import { walletConf } from '../config';

type GuildWalletsManager = Collection<DiscordGuildMember, GuildWalletManager>;

const guildWalletsManagers: Collection<Guild, GuildWalletsManager> = new Collection();

function getGuildWalletsManager(guild: Guild) {
	if (!guildWalletsManagers.get(guild)) {
		guildWalletsManagers.set(guild, new Collection());
	}

	return guildWalletsManagers.get(guild) as GuildWalletsManager;
}

export function getGuildWalletManager(member: DiscordGuildMember, guild: Guild) {
	const guildWalletsManager = getGuildWalletsManager(guild);

	if (!guildWalletsManager.get(member)) {
		guildWalletsManager.set(member, new GuildWalletManager(member));
	}

	return guildWalletsManager.get(member) as GuildWalletManager;
}

export class GuildWalletManager {
	private _db?: DatabaseGuildMember;
	private _discord: DiscordGuildMember;

	constructor(member: DiscordGuildMember) {
		this._discord = member;
	}

	private async _createEntryIfNotExists(): Promise<Boolean> {
		if (this._db) return true;

		const entryExists = await p.member.findUnique({
			where: {
				userId_guildId: {
					userId: this._discord.user.id,
					guildId: this._discord.guild.id
				}
			}
		});

		if (entryExists) {
			this._db = entryExists;

			return true;
		}

		const member = await p.member.create({
			data: {
				user: {
					connectOrCreate: {
						where: {
							id: this._discord.id
						},
						create: {
							id: this._discord.id
						}
					}
				},
				guild: {
					connectOrCreate: {
						where: {
							id: this._discord.guild.id
						},
						create: {
							id: this._discord.guild.id
						}
					}
				}
			}
		});

		this._db = member;

		return true;
	}

	async read() {
		await this._createEntryIfNotExists();

		return this._db as DatabaseGuildMember;
	}

	async update(money: Prisma.IntFieldUpdateOperationsInput, actor: DiscordGuildMember | User) {
		await this._createEntryIfNotExists();

		const currentWallet = await p.member.update({
			where: {
				userId_guildId: {
					userId: this._db?.userId as string,
					guildId: this._db?.guildId as string
				}
			},
			data: {
				money
			}
		});

		const channel = this._discord.guild.channels.cache.get(walletConf.log.channel as string);

		if (!channel?.isTextBased()) return;

		const embed = new EmbedBuilder({
      footer: {
        text: `Action by ${actor.displayName}`,
        iconURL: actor.displayAvatarURL()
      }
    });

		const title = (operation: string, amount: number, preposition?: string) =>
			`${operation} ${amount} ${preposition ?? 'to'} ${this._discord.user.username}${this._discord.user.tag}'s balance`;

		if (money.increment) {
			embed.setColor('#57F287');
			embed.setTitle(title('Added', money.increment));
		} else if (money.decrement) {
			embed.setColor('#ED4245');
			embed.setTitle(title('Deducted', money.decrement, 'from'));
		} else if (money.set) {
			embed.setColor('#EB459E');
			embed.setTitle(title('Set', money.set));
		}

		embed.setDescription(`They now have ${currentWallet.money} in the balance`);

		channel.send({ embeds: [embed] });

		this._db = currentWallet;

		return this._db;
	}
}
