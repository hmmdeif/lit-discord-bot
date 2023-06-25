import { Contract } from 'ethers'

export interface IBunniLPContract extends Contract {
    name(): Promise<string>
}
