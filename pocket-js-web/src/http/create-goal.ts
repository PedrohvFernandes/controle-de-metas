import { type CreateGoalRequest, routes } from '../types'

export async function createGoal({
  title,
  desiredWeeklyFrequency,
}: CreateGoalRequest) {
  await fetch(routes.goals, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, desiredWeeklyFrequency }),
  })
}
