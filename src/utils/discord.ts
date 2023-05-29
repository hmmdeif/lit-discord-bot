import { log } from './helpers'
import { DISCORD_TOKEN } from '../config'
import { ActivityType, Client, Events, GatewayIntentBits } from 'discord.js'
import chalk from 'chalk'
import { BigNumber } from 'ethers'

let client = new Client({ intents: [GatewayIntentBits.Guilds] })

export const startup = async () => {
    client.once(Events.ClientReady, (c) => {
        log(chalk.green(`Ready! Logged in as ${c.user.tag}`))
    })

    client.login(DISCORD_TOKEN)
}

export const updatePresence = async (totalSupply: BigNumber, price: number) => {
    const priceStr = `$${price.toFixed(3)}`
    const activityStr = `${(
        totalSupply.div(BigNumber.from(10).pow(21)).toNumber() / 1000
    ).toFixed(3)}M Market Cap`
    log(chalk.white(`Setting name: ${priceStr}`))
    log(chalk.white(`Setting activity: ${activityStr}`))

    client.guilds.cache.forEach(async (guild) => {
        const me = await guild.members.fetchMe()
        if (me) {
            me.setNickname(priceStr)
        }
    })    
    client.user?.setPresence({
        activities: [
            {
                type: ActivityType.Watching,
                name: activityStr,
            },
        ],
    })
}
