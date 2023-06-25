import { ContractCall, all } from './utils/multicall'
import * as gauge_abi from './abis/gauge_abi.json'
import * as bunni_lp_abi from './abis/bunni_lp_abi.json'

export const getGaugeInfo = async (
    gaugeAddresses: string[]
): Promise<{ [key: string]: string }> => {
    // get all lp tokens for gauges
    const lpTokenParams = (gauge_abi as any).default.find(
        (x: any) => x.name == 'lp_token'
    ) as any
    const lpTokenCall = gaugeAddresses.map((g) => {
        return {
            contract: {
                address: g,
            },
            name: lpTokenParams.name,
            inputs: lpTokenParams.inputs,
            outputs: lpTokenParams.outputs,
            params: [],
        } as ContractCall
    })
    const lpTokens = await all<string[]>(lpTokenCall)

    // get names for all lp tokens
    const nameParams = (bunni_lp_abi as any).default.find(
        (x: any) => x.name == 'name'
    ) as any
    const nameCall = lpTokens.map((g) => {
        return {
            contract: {
                address: g,
            },
            name: nameParams.name,
            inputs: nameParams.inputs,
            outputs: nameParams.outputs,
            params: [],
        } as ContractCall
    })
    const names = await all<string[]>(nameCall)

    return gaugeAddresses.reduce((acc: { [key: string]: string }, cur, i) => {
        // names[i] is in format "Bunni XXX/XXX LP" and we should remove "Bunni" and "LP" from this string
        acc[cur] = names[i].split(' ').slice(1, -1).join(' ') // thanks copilot
        return acc
    }, {})
}
