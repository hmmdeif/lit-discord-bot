const store: any = {}

export enum StoreKey {
    bribeInfo,
    currentPresenceIndex,
}

export interface IBribeInfo {
    gauge: string
    dollarPerVeLIT: number
    totalBribeInDollars: number
    name: string
}

export const getStore = (key: StoreKey) => {
    return store[key]
}

export const setStore = (key: StoreKey, value: any) => {
    store[key] = value
}
