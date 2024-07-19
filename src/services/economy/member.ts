import { Guild, User } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function getMember(user: User, guild: Guild) {
	let member = await prisma.member.findUnique({
		where: {
			userId_guildId: {
				guildId: guild.id,
				userId: user.id
			}
		}
	});

	if (!member) {
		member = await prisma.member.create({
			data: {
				guildId: guild.id,
				userId: user.id,
				wallet: {}
			}
		});
	}

	return member;
}
