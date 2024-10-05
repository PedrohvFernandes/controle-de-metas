import { routes } from '../types'

export async function createGoalCompletion(goalId: string) {
  await fetch(routes.completions, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goalId }),
  })
}
