import { Args, Command } from '@sapphire/framework';
import { GuildMember, type Message } from 'discord.js';
import { getGuild } from '../../services/economy/guild';
import { getMember } from '../../services/economy/member';
import { getUser } from '../../services/economy/user';
import { colors, DefaultEmbed, LoadingEmbed } from '../../lib/embeds';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({
	aliases: ['wallet', 'bal', 'balance', 'money', 'dollah', '$$$', 'rupiah', 'ruppee', 'paisa', 'rokra'],
	description: 'Check your balance!',
	detailedDescription: 'This command is used to `check` your balance (available to everyone).',
	requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
	requiredUserPermissions: ['ViewChannel', 'SendMessages', 'UseApplicationCommands'],
	runIn: ['GUILD_ANY']
})
export class WalletCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('member').setDescription('The user to check the balance of.').setRequired(false))
		);
	}

	public override async messageRun(message: Message, args: Args) {
		const target = await args.pick('member').catch(() => message.member as GuildMember);

		const loading = await message.reply({
			embeds: [new LoadingEmbed(message, 'Fetching your wallet')]
		});

		const guild = await getGuild(message.guildId!);
		const user = await getUser(target.id);
		const member = await getMember(user, guild);

		const embed = new DefaultEmbed(message)
			.setTitle(`${target.displayName}'s Wallet`)
			.setDescription(`You have **${member.wallet.amount}** coins in your wallet!`)
			.setAuthor({
				name: target.displayName,
				iconURL: target.displayAvatarURL()
			})
			.setColor(colors.green);

		await message.reply({ embeds: [embed] });

		await loading.delete();
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = interaction.options.getUser('member') ?? interaction.user;

		await interaction.deferReply();

		const guild = await getGuild(interaction.guildId!);
		const user = await getUser(target.id);
		const member = await getMember(user, guild);

		const embed = new DefaultEmbed(interaction)
			.setTitle(`${target.username}'s Wallet`)
			.setDescription(`You have **${member.wallet.amount}** coins in your wallet!`)
			.setAuthor({
				name: target.username,
				iconURL: target.displayAvatarURL()
			})
			.setColor(colors.green);

		await interaction.reply({ embeds: [embed] });
	}
}
