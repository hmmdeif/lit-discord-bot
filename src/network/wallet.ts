import { providers } from 'ethers'
import { RPC } from '../config'

// use static so that it doesn't request eth_chainid all the time
let provider: providers.StaticJsonRpcProvider

export const getProvider = (): providers.StaticJsonRpcProvider => {
    if (!provider) {
        provider = new providers.StaticJsonRpcProvider(RPC)
    }
    return provider
}
