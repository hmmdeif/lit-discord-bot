import chalk from 'chalk'
import { BigNumber, utils } from 'ethers'

export const ADDRESS_NULL = '0x0000000000000000000000000000000000000000'

export const getTimeStamp = () => {
    const d = new Date()
    return `[${padDateTime(d.getDate())}/${padDateTime(
        d.getMonth() + 1
    )}/${d.getFullYear()} ${padDateTime(d.getHours())}:${padDateTime(
        d.getMinutes()
    )}:${padDateTime(d.getSeconds())}]`
}

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const padDateTime = (n: number): string => {
    return n.toString().padStart(2, '0')
}

export const log = (msg: string) => {
    console.log(`${chalk.gray(getTimeStamp())} ${msg}`)
}

export class BigNumberUtils {
    protected oneBN: BigNumber = utils.parseUnits('1', 18)

    public multiply(bn: BigNumber | string, number: number): BigNumber {
        const bnForSure = BigNumber.from(bn)
        const numberBN = utils.parseUnits(number.toString(), 18)

        return bnForSure.mul(numberBN).div(this.oneBN)
    }

    public divide(bn: BigNumber | string, number: number): BigNumber {
        const bnForSure = BigNumber.from(bn)
        const numberBN = utils.parseUnits(number.toString(), 18)

        return bnForSure.div(numberBN).div(this.oneBN)
    }
}

export const bigNumberUtils = new BigNumberUtils()
