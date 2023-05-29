export enum ContractAddress {
    multicall,
    lit,
    weth,
    usdc,
}

export enum PoolAddress {
    weth_usdc_pool,
    lit_weth_pool,
}

export const addresses: { [key: string]: string } = {
    [ContractAddress.lit]: '0xfd0205066521550D7d7AB19DA8F72bb004b4C341',
    [ContractAddress.weth]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [ContractAddress.usdc]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [ContractAddress.multicall]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
}

export const pools: { [key: string]: string } = {
    [PoolAddress.weth_usdc_pool]:
        '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019',
    [PoolAddress.lit_weth_pool]:
        '0x9232a548dd9e81bac65500b5e0d918f8ba93675c000200000000000000000423',
}
