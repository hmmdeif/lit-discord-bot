import { ContractAddress, addresses } from './network/addresses'
import { getContract } from './network/contract'
import * as paladin_quest_board_abi from './abis/paladin_quest_board_abi.json'
import {
    IPaladinQuestBoardContract,
    Quest,
    QuestPeriod,
} from './interfaces/IPaladinQuestBoardContract'
import { ContractCall, all } from './utils/multicall'
import { CoinResult, getCoins } from './utils/defillama_api'
import { utils } from 'ethers'
import { bigNumberUtils } from './utils/helpers'

export const updateWardenBribeInfo = async () => {
    const contract = getContract(
        addresses[ContractAddress.paladin_quest_board],
        paladin_quest_board_abi
    ) as IPaladinQuestBoardContract

    const currentPeriod = await contract.getCurrentPeriod()
    const questIds = await contract.getQuestIdsForPeriod(currentPeriod)

    // get quest details for current period
    const periodsByQuestParams = (paladin_quest_board_abi as any).default.find(
        (x: any) => x.name == 'periodsByQuest'
    ) as any
    const periodsByQuestCall = questIds.map((q) => {
        return {
            contract: {
                address: addresses[ContractAddress.paladin_quest_board],
            },
            name: periodsByQuestParams.name,
            inputs: periodsByQuestParams.inputs,
            outputs: periodsByQuestParams.outputs,
            params: [q, currentPeriod],
        } as ContractCall
    })
    const periodsByQuest = await all<QuestPeriod[]>(periodsByQuestCall)

    // get reward details for the quest
    const questsParams = (paladin_quest_board_abi as any).default.find(
        (x: any) => x.name == 'quests'
    ) as any
    const questsCall = questIds.map((q) => {
        return {
            contract: {
                address: addresses[ContractAddress.paladin_quest_board],
            },
            name: questsParams.name,
            inputs: questsParams.inputs,
            outputs: questsParams.outputs,
            params: [q],
        } as ContractCall
    })
    const quests = await all<Quest[]>(questsCall)

    // get unique list of rewardToken addresses in quests result
    const rewardTokens = quests
        .map((q) => q.rewardToken)
        .filter((v, i, a) => a.indexOf(v) === i)

    // get spot price using defillama api
    const spotPrices: CoinResult = await getCoins(
        rewardTokens.map((r) => `ethereum:${r}`)
    )

    // return bribe info
    return periodsByQuest.map((p, i) => {
        const price =
            spotPrices.coins[`ethereum:${quests[i].rewardToken}`].price

        return {
            dollarPerVeLIT: Number(
                utils.formatEther(
                    bigNumberUtils.multiply(p.rewardPerVote, price)
                )
            ),
            gauge: quests[i].gauge,
            totalBribeInDollars: Number(
                utils.formatEther(
                    bigNumberUtils.multiply(p.rewardAmountPerPeriod, price)
                )
            ),
            objectiveVotes: utils.formatEther(p.objectiveVotes),
            name: '',
        }
    })
}
