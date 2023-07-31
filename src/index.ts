import './lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { cyan } from 'colorette';
import { GatewayIntentBits } from 'discord.js';
import express from 'express'

const client = new SapphireClient({
	defaultPrefix: '!',
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
	loadMessageCommandListeners: true
});

const app = express()

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in');

    app.listen(3000, () => {
      client.logger.info(`Listening on port ${cyan(3000)}, http://localhost:3000`)
    })

    app.get('/', (_, res) => {
      res.json(client.toJSON())
    })
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
