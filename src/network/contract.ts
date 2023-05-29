import chalk from 'chalk'
import { Contract } from 'ethers'
import { Interface } from 'ethers/lib/utils'
import { addresses, ContractAddress } from './addresses'
import { getProvider } from './wallet'

export const getContract = (
    address: ContractAddress | string,
    abi: any
): Contract | null => {
    if (typeof address === 'string') {
        return new Contract(address, new Interface(abi.default), getProvider())
    }

    if (!(address in addresses)) {
        console.log(
            chalk.red(
                `${address} is not a valid Contract Address (it could be missing)`
            )
        )
        return null
    }

    return new Contract(
        addresses[address],
        new Interface(abi.default),
        getProvider()
    )
}
