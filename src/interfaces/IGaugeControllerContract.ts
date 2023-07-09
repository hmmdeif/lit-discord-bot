import { BigNumber, Contract } from 'ethers'

export interface IGaugeControllerContract extends Contract {
    get_gauge_weight(gauge: string): Promise<BigNumber>
    time_total(): Promise<BigNumber>
    n_gauges(): Promise<BigNumber>
    gauges(index: number): Promise<string>
}
