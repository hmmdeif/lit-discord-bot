import { Contract } from 'ethers'

export interface IGaugeContract extends Contract {
    lp_token(): Promise<string>
}
