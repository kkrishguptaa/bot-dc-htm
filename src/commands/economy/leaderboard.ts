import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import { p } from '../../lib/prisma/client';

export class LeaderboardCommand extends Command {
  constructor(context: Command.Context) {
    super(context, {
      aliases: ['leaderboard', 'top', 'richest', 'rich', 'richies', 'scroogemcducks', 'batmans', 'tonystarks', 'billionaires', 'millionaires'],
      description: "Check the scroogemcducks of the server!",
      detailedDescription:
        "This command is used to `check` the richest people of the server (available to everyone)",
      requiredClientPermissions: ['ViewChannel', 'SendMessages', 'EmbedLinks'],
      requiredUserPermissions: ['ViewChannel', 'SendMessages', 'UseApplicationCommands']
    })
  }
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
