import { BigNumber, Contract } from 'ethers'

export interface IGaugeControllerContract extends Contract {
    get_gauge_weight(gauge: string): Promise<BigNumber>
}
