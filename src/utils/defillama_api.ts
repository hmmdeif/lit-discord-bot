const baseUrl = 'https://coins.llama.fi'

export interface Coin {
    decimals: number
    symbol: string
    price: number
    timestamp: number
    confidence: number
}

export interface CoinResult {
    coins: { [key: string]: Coin }
}

export interface BlockResult {
    height: number
    timestamp: number
}

export const getCoins = async (
    tokenAddresses: string[]
): Promise<CoinResult> => {
    const response = await fetch(
        `${baseUrl}/prices/current/${tokenAddresses.join(
            ','
        )},coingecko:ethereum`
    )
    return response.json()
}

export const getBlockForTimestamp = async (
    chain: string,
    timestamp: number
): Promise<BlockResult> => {
    const response = await fetch(`${baseUrl}/block/${chain}/${timestamp}`)
    return response.json()
}
