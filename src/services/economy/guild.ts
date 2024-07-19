import { prisma } from '../../lib/prisma';

export async function getGuild(guildId: string) {
	let guild = await prisma.guild.findUnique({
		where: {
			id: guildId
		}
	});

	if (!guild) {
		guild = await prisma.guild.create({
			data: {
				id: guildId,
				economy: {
					log: {
						channel: null
					},
					blacklist: {},
					cooldowns: {},
					rewards: {}
				}
			}
		});
	}

	return guild;
}
