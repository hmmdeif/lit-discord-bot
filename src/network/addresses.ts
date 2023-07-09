export enum ContractAddress {
    multicall,
    lit,
    weth,
    usdc,
    paladin_quest_board,
    hidden_hand_bribe,
    hidden_hand_bribe_v2,
    gauge_controller,
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
    [ContractAddress.paladin_quest_board]:
        '0x602E94D90F34126f31444D001732a1974378D9FC',
    [ContractAddress.hidden_hand_bribe]:
        '0x78C45fBDB71E7c0FbDfe49bDEFdACDcc4764336f',
    [ContractAddress.hidden_hand_bribe_v2]:
        '0x175b01eF7CEa8615B1D9485BC827378EA5D50C86',
    [ContractAddress.gauge_controller]:
        '0x901c8aA6A61f74aC95E7f397E22A0Ac7c1242218',
}

export const pools: { [key: string]: string } = {
    [PoolAddress.weth_usdc_pool]:
        '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019',
    [PoolAddress.lit_weth_pool]:
        '0x9232a548dd9e81bac65500b5e0d918f8ba93675c000200000000000000000423',
}
