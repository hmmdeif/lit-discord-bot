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
