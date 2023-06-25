import { Contract, ethers } from 'ethers'
import { ContractAddress, addresses } from '../network/addresses'
import { getContract } from '../network/contract'
import * as multicallABI from '../abis/multicall_abi.json'

export interface ContractCall {
    contract: {
        address: string
    }
    name: string
    inputs: ethers.utils.ParamType[]
    outputs: ethers.utils.ParamType[]
    params: any[]
}

export const encode = (
    name: string,
    inputs: ethers.utils.ParamType[],
    params: any[]
) => {
    const functionSignature = getFunctionSignature(name, inputs)
    const functionHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(functionSignature)
    )
    const functionData = functionHash.substring(2, 10)
    const abiCoder = new ethers.utils.AbiCoder()
    const argumentString = abiCoder.encode(inputs, params)
    const argumentData = argumentString.substring(2)
    const inputData = `0x${functionData}${argumentData}`
    return inputData
}

export const decode = (
    outputs: ethers.utils.ParamType[],
    data: ethers.utils.BytesLike
) => {
    const abiCoder = new ethers.utils.AbiCoder()
    const params = abiCoder.decode(outputs, data)
    return params
}

const getFunctionSignature = (
    name: string,
    inputs: ethers.utils.ParamType[]
): string => {
    const types = []
    for (const input of inputs) {
        if (input.type === 'tuple') {
            const tupleString = getFunctionSignature('', input.components)
            types.push(tupleString)
            continue
        }
        if (input.type === 'tuple[]') {
            const tupleString = getFunctionSignature('', input.components)
            const arrayString = `${tupleString}[]`
            types.push(arrayString)
            continue
        }
        types.push(input.type)
    }
    const typeString = types.join(',')
    const functionSignature = `${name}(${typeString})`
    return functionSignature
}

export const all = async <T extends any[] = any[]>(calls: ContractCall[]) => {
    const multicall = getContract(
        addresses[ContractAddress.multicall],
        multicallABI
    ) as Contract

    const callRequests = calls.map((call) => {
        const callData = encode(call.name, call.inputs, call.params)
        return {
            target: call.contract.address,
            callData,
        }
    })
    const response = await multicall.callStatic.aggregate(callRequests)
    const callCount = calls.length
    const callResult = []
    for (let i = 0; i < callCount; i++) {
        const outputs = calls[i].outputs
        const returnData = response.returnData[i]
        const params = decode(outputs, returnData)
        const result = outputs.length === 1 ? params[0] : params
        callResult.push(result)
    }
    return callResult as T
}
