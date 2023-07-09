import { BigNumber, Contract } from 'ethers'

export interface Bribe {
    bribeToken: string
    bribeAmount: BigNumber
}

export interface IHiddenHandBribeV2Contract extends Contract {
    BRIBE_VAULT(): Promise<string>
    getGauges(): Promise<string[]>
    getWhitelistedTokens(): Promise<string[]>
    proposalDeadlines(gaugeAddress: string): Promise<BigNumber>
    getBribe(
        proposal: string,
        proposalDeadline: BigNumber,
        token: string
    ): Promise<Bribe>
}
