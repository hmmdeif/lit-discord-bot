import { BigNumber, Contract } from 'ethers'

export interface QuestPeriod {
    rewardAmountPerPeriod: BigNumber
    rewardPerVote: BigNumber
    objectiveVotes: BigNumber
    rewardAmountDistributed: BigNumber
    withdrawableAmount: BigNumber
    periodStart: number
    currentState: number
}

export interface Quest {
    creator: string
    rewardToken: string
    gauge: string
    duration: number
    periodStart: number
    totalRewardAmount: BigNumber
}

export interface IPaladinQuestBoardContract extends Contract {
    getCurrentPeriod(): Promise<BigNumber>
    getQuestIdsForPeriod(period: BigNumber): Promise<BigNumber[]>
    periodsByQuest(questId: BigNumber, period: BigNumber): Promise<QuestPeriod>
    quests(questId: BigNumber): Promise<Quest>
}
