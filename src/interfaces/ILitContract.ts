import { BigNumber, Contract } from 'ethers'

export interface ILitContract extends Contract {
    totalSupply(): Promise<BigNumber>
}
