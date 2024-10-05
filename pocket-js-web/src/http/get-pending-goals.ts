import { type PendingGoalsResponse, routes } from '../types'

export async function getPendingGoals(): Promise<PendingGoalsResponse> {
  const response = await fetch(routes.pendingGoals)
  const data = await response.json()

  return data.pendingGoals
}

export const keyPendingGoals = 'pending-goals'

export const staleTimePendingGoals = 1000 * 60
