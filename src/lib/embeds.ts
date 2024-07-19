import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import type { APIEmbed, ColorResolvable, EmbedData, Interaction, Message } from 'discord.js';

export const colors: {
	[key: string]: ColorResolvable;
} = {
	yellow: '#FEE75C',
	green: '#57F287',
	red: '#F04947'
};

export class DefaultEmbed extends EmbedBuilder {
	constructor(message: Message | Interaction | Command.ContextMenuCommandInteraction, data?: EmbedData | APIEmbed) {
		super(data);

		this.setFooter({
			text: `Requested by ${message.member?.user.username}`
		});
		this.setTimestamp();
	}
}

export class LoadingEmbed extends DefaultEmbed {
	constructor(message: Message | Interaction | Command.ContextMenuCommandInteraction, title: string = 'Loading') {
		super(message);

		this.setTitle(`🔄 ${title}...`);
		this.setColor(colors.yellow);
	}
}

export class ErrorEmbed extends DefaultEmbed {
	constructor(
		message: Message | Interaction | Command.ContextMenuCommandInteraction,
		title: string = 'Error',
		description: string = 'An error occurred.'
	) {
		super(message);

		this.setTitle(`❌ ${title}`);
		this.setDescription(description);
		this.setColor(colors.red);
	}
}
