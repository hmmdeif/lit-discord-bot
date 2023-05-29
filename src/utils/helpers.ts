import chalk from 'chalk'

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
