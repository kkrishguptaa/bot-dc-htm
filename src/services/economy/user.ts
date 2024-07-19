import { prisma } from '../../lib/prisma';

export async function getUser(userId: string) {
	let user = await prisma.user.findUnique({
		where: {
			id: userId
		}
	});

	if (!user) {
		user = await prisma.user.create({
			data: {
				id: userId
			}
		});
	}

	return user;
}
