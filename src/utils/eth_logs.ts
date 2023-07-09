import { getProvider } from '../network/wallet'

export const getLogs = async (
    fromBlock: number,
    address: string,
    topics: string[]
) => {
    const provider = getProvider()
    return provider.getLogs({
        fromBlock,
        toBlock: 'latest',
        address,
        topics,
    })
}
