export const walletConf = {
  log: {
    channel: process.env.ECONOMY_LOG_CHANNEL
  },
  onMessageMoney: {
    cooldown: process.env.ECONOMY_MESSAGE_COOLDOWN, // in minutes
    amount: process.env.ECONOMY_MESSAGE_AMOUNT?.split(',') // one of these
  },
  blockedChannels: process.env.ECONOMY_BLACKLIST_CHANNELS?.split(',')
}
