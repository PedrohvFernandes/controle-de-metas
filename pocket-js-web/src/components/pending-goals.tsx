import { Plus } from 'lucide-react'
import { OutlineButton } from './ui/outline-button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PendingGoalsResponse } from '../types'
import {
  createGoalCompletion,
  getPendingGoals,
  keyPendingGoals,
  keySummary,
} from '../http'

export function PendingGoals() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<PendingGoalsResponse>({
    queryKey: [keyPendingGoals],
    queryFn: getPendingGoals,
    // staleTime: staleTimePendingGoals,
  })

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!data) {
    return <div>Erro ao carregar</div>
  }

  async function handleCompleteGoal(goalId: string) {
    await createGoalCompletion(goalId)

    // Invalida a query para que ela seja refeita e os dados atualizados.
    queryClient.invalidateQueries({
      queryKey: [keySummary],
    })

    queryClient.invalidateQueries({
      queryKey: [keyPendingGoals],
    })
  }

  return (
    //Flex-wrap: quebra a linha quando o conteúdo não cabe mais no container.
    <div className="flex flex-wrap gap-3">
      {data.map(goal => {
        return (
          <OutlineButton
            key={goal.id}
            onClick={() => handleCompleteGoal(goal.id)}
            disabled={goal.completionCount >= goal.desiredWeeklyFrequency}
          >
            <Plus className="size-4 text-zinc-600" />
            {goal.title}
          </OutlineButton>
        )
      })}
    </div>
  )
}
