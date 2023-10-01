import { Command, type PieceContext } from '@sapphire/framework';
import { ApplicationCommandType, EmbedBuilder, GuildMember } from 'discord.js';
import { Subcommand, type SubcommandOptions } from '@sapphire/plugin-subcommands';
import { getGuildWalletManager } from '../../lib/prisma/wallet';

function embeds() {
	const loadingEmbed = new EmbedBuilder({
		title: '🔂 Loading...'
	}).setColor('#FEE75C');

	const walletAmountEmbed = (member: GuildMember, wallet: number) => {
		return new EmbedBuilder({
			title: `💰 ${member.displayName} has ${wallet} 🪙 `,
			description: "Don't worry what others say, in my opinion, you are a rich boi."
		}).setColor('#EB459E');
	};

	const errorEmbed = (err?: string) =>
		new EmbedBuilder({
			title: '⚠️ Error',
			description: err ?? 'An expected error has occured please contact user: `xkrishguptaa` for support'
		}).setColor('#ED4245');

	return {
		loadingEmbed,
		walletAmountEmbed,
		errorEmbed
	};
}

export class WalletCommand extends Subcommand {
	constructor(context: PieceContext, options?: SubcommandOptions) {
		super(context, {
			...options,
      aliases: ['wallet', 'bal', 'balance', 'money', 'dollah', '$$$', 'rupiah', 'ruppee', 'paisa', 'rokra' ],
      description: 'Check your balance!',
      detailedDescription:
        'This command is used to `check` your balance (available to everyone) and `update` and `set` balance of other people (if you are an admin)',
      requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
      requiredUserPermissions: ['ViewChannel', 'SendMessages', 'UseApplicationCommands'],
			subcommands: [
				{
					name: 'check',
					type: 'method',
					async messageRun(message, args) {
						const { loadingEmbed, walletAmountEmbed, errorEmbed } = embeds();

						if (!message.inGuild() || !message.member) {
							return message.reply({
								embeds: [errorEmbed("Wallets are for guilds's members, you cannot run this command outside of guild")]
							});
						}

						const loading = await message.reply({
							embeds: [loadingEmbed]
						});

						const member = (await args.pick('member').catch(() => message.member)) || message.member;

						const wallet = getGuildWalletManager(member, member.guild);

						return loading.edit({
							embeds: [walletAmountEmbed(member, (await wallet.read()).money)]
						});
					},
					default: true
				},
				{
					name: 'add',
					type: 'method',
					async messageRun(message, args) {
						const { errorEmbed } = embeds();

						if (!message.inGuild() || !message.member) {
							return message.reply({
								embeds: [errorEmbed("Wallets are for guilds's members, you cannot run this command outside of guild")]
							});
						}

						if (!message.member.permissions.has('ManageMessages')) {
							return message.reply({
								embeds: [errorEmbed("'Kya phook ke aaya hai be?' - Sharan Hegde, This command can only be run by admins")]
							});
						}

						const member = await args.pick('member');

						const amount = args.finished ? undefined : await args.rest('number');

						if (!amount || !member) {
							return message.reply({
								embeds: [errorEmbed('Provided arguments are incorrect')]
							});
						}

						const wallet = getGuildWalletManager(member, member.guild);

						const currentWallet = await wallet.update({
							increment: amount
						}, message.member);

						message.reply('Operation Strix, Completed. Check DMs');

						const dm = await message.author.createDM(true);

						return dm.send(`Task accomplised ${member.displayName} now has ${currentWallet?.money}`);
					}
				},
				{
					name: 'remove',
					type: 'method',
          async messageRun(message, args) {
						const { errorEmbed } = embeds();

						if (!message.inGuild() || !message.member) {
							return message.reply({
								embeds: [errorEmbed("Wallets are for guilds's members, you cannot run this command outside of guild")]
							});
						}

						if (!message.member.permissions.has('ManageMessages')) {
							return message.reply({
								embeds: [errorEmbed("'Kya phook ke aaya hai be?' - Sharan Hegde, This command can only be run by admins")]
							});
						}

						const member = await args.pick('member');

						const amount = args.finished ? undefined : await args.rest('number');

						if (!amount || !member) {
							return message.reply({
								embeds: [errorEmbed('Provided arguments are incorrect')]
							});
						}

						const wallet = getGuildWalletManager(member, member.guild);

						const currentWallet = await wallet.update({
							decrement: amount
						}, message.member);

						message.reply('Operation Strix, Completed. Check DMs');

						const dm = await message.author.createDM(true);

						return dm.send(`Task accomplised ${member.displayName} now has ${currentWallet?.money}`);
					}
				},
				{
					name: 'set',
					type: 'method',
          async messageRun(message, args) {
						const { errorEmbed } = embeds();

						if (!message.inGuild() || !message.member) {
							return message.reply({
								embeds: [errorEmbed("Wallets are for guilds's members, you cannot run this command outside of guild")]
							});
						}

						if (!message.member.permissions.has('ManageMessages')) {
							return message.reply({
								embeds: [errorEmbed("'Kya phook ke aaya hai be?' - Sharan Hegde, This command can only be run by admins")]
							});
						}

						const member = await args.pick('member');

						const amount = args.finished ? undefined : await args.rest('number');

						if (!amount || !member) {
							return message.reply({
								embeds: [errorEmbed('Provided arguments are incorrect')]
							});
						}

						const wallet = getGuildWalletManager(member, member.guild);

						const currentWallet = await wallet.update({
							set: amount
						}, message.member);

						message.reply('Operation Strix, Completed. Check DMs');

						const dm = await message.author.createDM(true);

						return dm.send(`Task accomplised ${member.displayName} now has ${currentWallet?.money}`);
					}
				}
			]
		});
	}
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerContextMenuCommand((builder) => builder.setName('Check Balance').setType(ApplicationCommandType.User));
	}

	public async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		const { loadingEmbed, walletAmountEmbed, errorEmbed } = embeds();
		if (!interaction.guild || (!interaction.isUserContextMenuCommand() && interaction.targetId)) {
			return interaction.reply({
				embeds: [
					errorEmbed(
						"Wallets are for guilds's members, you cannot run this command outside of guild, or without selecting a user in the guild"
					)
				],
				ephemeral: true
			});
		}

		if (interaction.guild.members.cache.get(interaction.targetId)?.user.bot) {
			return interaction.reply({
				embeds: [errorEmbed("Although, I'm a bot myself, I hate to break it, bots don't have wallets")],
				ephemeral: true
			});
		}

		await interaction.reply({
			embeds: [loadingEmbed],
			ephemeral: true
		});

		const member = interaction.guild.members.cache.get(interaction.targetId) as GuildMember;

		const wallet = getGuildWalletManager(member, member.guild);

		return interaction.editReply({
			embeds: [walletAmountEmbed(member, (await wallet.read()).money)]
		});
	}
}
