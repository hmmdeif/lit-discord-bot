import * as gauge_controller_abi from '../abis/gauge_controller_abi.json'
import { IGaugeControllerContract } from '../interfaces/IGaugeControllerContract'
import { ContractAddress, addresses } from '../network/addresses'
import { getContract } from '../network/contract'
import { ContractCall, all } from './multicall'

export const getGauges = async () => {
    const contract = getContract(
        addresses[ContractAddress.gauge_controller],
        gauge_controller_abi
    ) as IGaugeControllerContract

    const gaugeCount = await contract.n_gauges()

    const gaugesParams = (gauge_controller_abi as any).default.find(
        (x: any) => x.name == 'gauges'
    ) as any
    const gaugesCall = Array(gaugeCount.toNumber())
        .fill(0)
        .map((_, i) => {
            return {
                contract: {
                    address: addresses[ContractAddress.gauge_controller],
                },
                name: gaugesParams.name,
                inputs: gaugesParams.inputs,
                outputs: gaugesParams.outputs,
                params: [i],
            } as ContractCall
        })

    return await all<string[]>(gaugesCall)
}

export const getCurrentPeriod = async () => {
    const contract = getContract(
        addresses[ContractAddress.gauge_controller],
        gauge_controller_abi
    ) as IGaugeControllerContract

    const timeTotal = await contract.time_total()
    const d = new Date(timeTotal.toNumber() * 1000)
    d.setUTCDate(d.getUTCDate() - 7)
    return d
}
