import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { firstLastDayWeek } from '../utils/first-and-last-day-week'

interface CreateGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  const { firstDayOfWeek, lastDayOfWeek } = firstLastDayWeek()

  const goalsCompletionCounts = db.$with('goals_completion_counts').as(
    // Seleciona todos os registros da tabela goalCompletions criados nessa semana. Agrupamos por goalId, ou seja, agrupamos por meta. Se eu tenho 3 registros com o mesmo goalId, ele vai agrupar esses 3 registros em um só, onde a data de criação seja maior ou igual ao primeiro dia da semana e menor ou igual ao ultimo dia da semana. Se eu tenho 3 registros com o mesmo goalId, ele vai agrupar esses 3 registros em um só, ou seja eu fiz ela 3 vezes na semana. Por exemplo nadar 3 vezes na semana, ele vai contar 3 vezes e agrupar em um só
    db
      .select({
        goalId: goalCompletions.goalId,
        // Quantas vezes a meta foi completada nessa semana de acordo com o goalId e agrupamos por goalId
        completionCount: count(goalCompletions.id).as('completionCount'), // Sempre que eu fizer um count, somar... eu preciso dar um alias, um nome para essa agregação, para esse campo, dentro de uma common table --> As
      })
      .from(goalCompletions)
      .where(
        and(
          // Data de criação maior ou igual ao primeiro dia da semana
          gte(goalCompletions.completedAt, firstDayOfWeek),
          // Data de criação menor ou igual ao ultimo dia da semana
          lte(goalCompletions.completedAt, lastDayOfWeek),
          // Dessa forma evitamos de incluir dados de outra meta que não seja a meta que queremos completar
          eq(goalCompletions.goalId, goalId)
        )
      )
      // Agrupamos por goalId, ou seja, agrupamos por meta. Se eu tenho 3 registros com o mesmo goalId, ele vai agrupar esses 3 registros em um só
      .groupBy(goalCompletions.goalId)
  )

  // Seleciona a meta e a quantidade de vezes que ela foi completada nessa semana, mostra a quantidade de vezes que a meta foi completada nessa semana e a frequencia desejada da meta. Esse sql funciona assim:
  const result = await db
    .with(goalsCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionsCount: sql /*sql*/`
        COALESCE(${goalsCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalsCompletionCounts, eq(goalsCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1) // Para garantir que so vai vir um resultado, mesmo sabendo que tem que ser assim, por conta do Where

  // Como eu sei que so vem um resultado, eu pego o primeiro resultado do array do sql
  const { completionsCount, desiredWeeklyFrequency } = result[0]

  // Se eu já completei a meta, ou seja, se a quantidade de vezes que eu completei a meta for maior ou igual a frequencia desejada da meta, eu não posso completar mais
  if (completionsCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({
      goalId,
    })
    .returning()

  const goalCompletion = insertResult[0]

  return {
    goalCompletion,
  }
}
