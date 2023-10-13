import './lib/setup'
import { LogLevel, SapphireClient } from '@sapphire/framework'
import { bgBlue, bold, cyan } from 'colorette'
import { GatewayIntentBits } from 'discord.js'
import express from 'express'
import { isDev } from './lib/constants'

const client = new SapphireClient({
  defaultPrefix: '!',
  caseInsensitiveCommands: true,
  logger: {
    level: isDev ? LogLevel.Debug : LogLevel.Info
  },
  intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
  loadMessageCommandListeners: true
})

const app = express()

const main = async (): Promise<void> => {
  try {
    await client.login()

    app.listen(3000, () => {
      client.logger.info(bgBlue(bold('API Service')))
      client.logger.info(bgBlue(`Listening on Port: ${bold('3000')}`))
      client.logger.info(bgBlue(`Status: ${bold('Online')}`))
      client.logger.info(bgBlue('Kamehameha! Your bot is ready to unleash its power! 💥🐉'))
    })

    app.get('/', (_, res): void => {
      res.json({
        status: 'ok',
        status_code: 200,
        client: JSON.parse(JSON.stringify(client, (_, v) => typeof v === 'bigint' ? v.toString() : v)),
        package: require('../package.json'),
        api: {
          port: 3000,
          uptime: process.uptime()
        }
      })
    })

    app.use((req, _, next) => {
      client.logger.debug(`[${cyan(0)}] - ${cyan(req.method)} ${cyan(req.url)} ${req.headers['user-agent'] ?? 'Unknown Device'}${cyan(req.ip)}`)
      next()
    })
  } catch (error) {
    client.logger.fatal(error)
    client.destroy().catch((reason): void => {
      client.logger.fatal('Bot is confused. It missed move \'Self-destruct\'', reason)
    })
    process.exit(1)
  }
}

main().catch(client.logger.fatal)
