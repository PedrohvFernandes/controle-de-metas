export type PendingGoals = {
  id: string
  title: string
  desiredWeeklyFrequency: number
  completionCount: number
}

export type PendingGoalsResponse = PendingGoals[]

export type CreateGoalRequest = {
  title: string
  desiredWeeklyFrequency: number
}
