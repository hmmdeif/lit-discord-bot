import {
    ContractAddress,
    PoolAddress,
    addresses,
    pools,
} from './network/addresses'
import { getContract } from './network/contract'
import { getTimeStamp, log, sleep } from './utils/helpers'
import * as lit_abi from './abis/lit_abi.json'
import chalk from 'chalk'

import {
    startup,
    updateActivityPresence,
    updatePricePresence,
} from './utils/discord'
import { ILitContract } from './interfaces/ILitContract'
import {
    BalancerSDK,
    BalancerSdkConfig,
    Network,
    BalancerError,
    BalancerErrorCode,
    PoolWithMethods,
} from '@balancer-labs/sdk'
import { DISPLAY_LIT_PRICE, RPC } from './config'
import { updateWardenBribeInfo } from './warden'
import { updateHiddenHandBribeInfo } from './hidden_hand'
import { getGaugeInfo } from './gauge'
import { IBribeInfo, StoreKey, getStore, setStore } from './store'
import { updateHiddenHandBribeV2Info } from './hidden_hand_v2'

const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: RPC,
}
const balancer = new BalancerSDK(config)

const updatePrice = async (
    litpool: PoolWithMethods,
    wethusdcpool: PoolWithMethods
) => {
    const litContract = getContract(
        ContractAddress.lit,
        lit_abi
    ) as ILitContract

    const litSpotPrice = await litpool.calcSpotPrice(
        addresses[ContractAddress.lit],
        addresses[ContractAddress.weth]
    )

    const wethUsdcSpotPrice = await wethusdcpool.calcSpotPrice(
        addresses[ContractAddress.usdc],
        addresses[ContractAddress.weth]
    )

    const totalLitSupply = await litContract.totalSupply()
    updatePricePresence(
        totalLitSupply,
        Number(wethUsdcSpotPrice) / Number(litSpotPrice)
    )
}

const updateBribeInfo = async () => {
    // get bribe info from warden and hidden hand
    const hiddenHandBribeV2Info = await updateHiddenHandBribeV2Info()
    const wardenBribeInfo = await updateWardenBribeInfo()
    const hiddenHandBribeInfo = await updateHiddenHandBribeInfo() // remove once epoch has passed

    const bribeInfo: IBribeInfo[] = []
    for (const bribe of [
        ...wardenBribeInfo,
        ...hiddenHandBribeInfo,
        ...hiddenHandBribeV2Info,
    ]) {
        const b = bribeInfo.find((x) => x.gauge == bribe.gauge)
        if (b) {
            b.dollarPerVeLIT = bribe.dollarPerVeLIT + b.dollarPerVeLIT
            b.totalBribeInDollars =
                bribe.totalBribeInDollars + b.totalBribeInDollars
        } else {
            bribeInfo.push(bribe)
        }
    }

    // get names of all the gauges
    const gaugeInfo = await getGaugeInfo(bribeInfo.map((x) => x.gauge))

    bribeInfo.forEach((b) => {
        b.name = gaugeInfo[b.gauge]
    })

    setStore(StoreKey.bribeInfo, bribeInfo)
}

const updateBribePresence = async () => {
    let currentPresenceIndex = getStore(StoreKey.currentPresenceIndex)
    const bribeInfo = getStore(StoreKey.bribeInfo) as IBribeInfo[]

    if (bribeInfo.length === 0) return
    if (currentPresenceIndex >= bribeInfo.length) currentPresenceIndex = 0

    const bribe = bribeInfo[currentPresenceIndex]
    updateActivityPresence(
        `${bribe.name}: $${bribe.dollarPerVeLIT.toFixed(
            4
        )}/veLIT $${bribe.totalBribeInDollars.toFixed(0)}`
    )

    setStore(StoreKey.currentPresenceIndex, currentPresenceIndex + 1)
}

;(async () => {
    log(chalk.bold.bgYellow(`Bunni LIT Bot Starting`))
    await startup()

    const litpool = await balancer.pools.find(pools[PoolAddress.lit_weth_pool])
    const wethusdcpool = await balancer.pools.find(
        pools[PoolAddress.weth_usdc_pool]
    )
    if (!litpool || !wethusdcpool)
        throw new BalancerError(BalancerErrorCode.POOL_DOESNT_EXIST)

    setStore(StoreKey.currentPresenceIndex, 0)
    let i = 0

    while (true) {
        try {
            // only update bribeInfo every 30 loops - 5 minutes
            if (i % 30 === 0) {
                log(chalk.bgGray('Updating info...'))
                if (DISPLAY_LIT_PRICE === 1) {
                    await updatePrice(litpool, wethusdcpool)
                }

                await updateBribeInfo()
            }

            await updateBribePresence()

            log(chalk.bgGreen('Loop finished'))
        } catch (e: any) {
            log(chalk.bold.bgRed('ERROR OCCURRED - CHECK LOG'))
            console.error(`${getTimeStamp()} ERROR LOGGED`)
            console.error(e)
        } finally {
            const wait = 10000 // 10 seconds
            log(chalk.gray(`Waiting for ${wait / 1000} seconds...`))
            ++i
            if (i == 30) i = 0
            await sleep(wait)
        }
    }
})()
