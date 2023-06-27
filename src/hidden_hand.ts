import { ContractAddress, addresses } from './network/addresses'
import { getContract } from './network/contract'
import * as hidden_hand_bribe_abi from './abis/hidden_hand_bribe_abi.json'
import * as erc20_abi from './abis/erc20_abi.json'
import * as gauge_controller_abi from './abis/gauge_controller_abi.json'
import {
    Bribe,
    IHiddenHandBribeContract,
} from './interfaces/IHiddenHandBribeContract'
import { ContractCall, all } from './utils/multicall'
import { BigNumber, utils } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'
import { CoinResult, getCoins } from './utils/defillama_api'
import { bigNumberUtils } from './utils/helpers'

export const updateHiddenHandBribeInfo = async () => {
    const contract = getContract(
        addresses[ContractAddress.hidden_hand_bribe],
        hidden_hand_bribe_abi
    ) as IHiddenHandBribeContract

    const gauges = await contract.getGauges()
    let whitelistedTokens = await contract.getWhitelistedTokens()
    const bribeVault = await contract.BRIBE_VAULT()
    whitelistedTokens = [...whitelistedTokens, bribeVault]

    // get all votes for each gauge
    const gaugeWeightParams = (gauge_controller_abi as any).default.find(
        (x: any) => x.name == 'get_gauge_weight'
    ) as any
    const gaugeWeightCall = gauges.map((g) => {
        return {
            contract: {
                address: addresses[ContractAddress.gauge_controller],
            },
            name: gaugeWeightParams.name,
            inputs: gaugeWeightParams.inputs,
            outputs: gaugeWeightParams.outputs,
            params: [g],
        } as ContractCall
    })
    const gaugeWeights = await all<BigNumber[]>(gaugeWeightCall)

    // keccak256 each gauge address to get proposals and their deadlines
    const proposalDeadlinesParams = (hidden_hand_bribe_abi as any).default.find(
        (x: any) => x.name == 'proposalDeadlines'
    ) as any
    const proposalDeadlinesCall = gauges.map((g) => {
        return {
            contract: {
                address: addresses[ContractAddress.hidden_hand_bribe],
            },
            name: proposalDeadlinesParams.name,
            inputs: proposalDeadlinesParams.inputs,
            outputs: proposalDeadlinesParams.outputs,
            params: [keccak256(g)],
        } as ContractCall
    })
    const proposalDeadlines = await all<BigNumber[]>(proposalDeadlinesCall)

    // get decimals of whitelisted bribe tokens
    const decimalsParams = (erc20_abi as any).default.find(
        (x: any) => x.name == 'decimals'
    ) as any
    const decimalsCall = whitelistedTokens
        .filter((t) => t !== bribeVault)
        .map((t) => {
            return {
                contract: {
                    address: t,
                },
                name: decimalsParams.name,
                inputs: decimalsParams.inputs,
                outputs: decimalsParams.outputs,
                params: [],
            } as ContractCall
        })
    const decimals = await all<number[]>(decimalsCall)
    const decimalsMap = whitelistedTokens.reduce((acc, t, i) => {
        acc[t] = decimals[i]
        return acc
    }, {} as { [key: string]: number })

    // get bribe info for each proposal and filter out bribes with 0 amount
    const activeBribes = []

    for (const token of whitelistedTokens) {
        const bribeParams = (hidden_hand_bribe_abi as any).default.find(
            (x: any) => x.name == 'getBribe'
        ) as any
        const bribeCall = gauges.map((g, i) => {
            return {
                contract: {
                    address: addresses[ContractAddress.hidden_hand_bribe],
                },
                name: bribeParams.name,
                inputs: bribeParams.inputs,
                outputs: bribeParams.outputs,
                params: [keccak256(g), proposalDeadlines[i], token],
            } as ContractCall
        })
        const bribes = await all<Bribe[]>(bribeCall)

        activeBribes.push(
            ...bribes
                .map((b, i) => {
                    return {
                        ...b,
                        gauge: gauges[i],
                        gaugeWeight: gaugeWeights[i].gt(0)
                            ? gaugeWeights[i]
                            : 1,
                    }
                })
                .filter((b) => b.bribeAmount.gt(0))
        )
    }

    // get spot price using defillama api
    const spotPrices: CoinResult = await getCoins(
        whitelistedTokens.map((t) => `ethereum:${t}`)
    )

    // return bribe info
    return activeBribes.map((b) => {
        const price =
            spotPrices.coins[
                b.bribeToken == bribeVault
                    ? 'coingecko:ethereum'
                    : `ethereum:${b.bribeToken}`
            ].price
        const decimal = decimalsMap[b.bribeToken] || 18
        const pow = BigNumber.from(10).pow(18 - decimal)

        return {
            dollarPerVeLIT: Number(
                utils.formatEther(
                    bigNumberUtils
                        .multiply(b.bribeAmount, price)
                        .mul(BigNumber.from(10).pow(18))
                        .div(b.gaugeWeight)
                )
            ),
            gauge: b.gauge,
            totalBribeInDollars: Number(
                utils.formatEther(
                    bigNumberUtils.multiply(b.bribeAmount, price).mul(pow)
                )
            ),
            totalVotes: utils.formatEther(b.gaugeWeight),
            name: '',
        }
    })
}
