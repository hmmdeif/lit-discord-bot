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

import { startup, updatePresence } from './utils/discord'
import { ILitContract } from './interfaces/ILitContract'
import {
    BalancerSDK,
    BalancerSdkConfig,
    Network,
    BalancerError,
    BalancerErrorCode,
    PoolWithMethods,
} from '@balancer-labs/sdk'
import { RPC } from './config'

const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: RPC,
}
const balancer = new BalancerSDK(config)

const main = async (
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
    updatePresence(
        totalLitSupply,
        Number(wethUsdcSpotPrice) / Number(litSpotPrice)
    )
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

    while (true) {
        try {
            log(chalk.bgGray('Updating presence...'))
            await main(litpool, wethusdcpool)

            log(chalk.bgGreen('Loop finished'))
        } catch (e: any) {
            log(chalk.bold.bgRed('ERROR OCCURRED - CHECK LOG'))
            console.error(`${getTimeStamp()} ERROR LOGGED`)
            console.error(e)
        } finally {
            const wait = 10000
            log(chalk.gray(`Waiting for ${wait / 1000} seconds...`))
            await sleep(wait)
        }
    }
})()
