// Arquivos para popularizar o banco de dados

import dayjs from 'dayjs'
import { client, db } from '.'
import { goalCompletions, goals } from './schema'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'Lose 10 pounds', desiredWeeklyFrequency: 1 },
      { title: 'Run a marathon', desiredWeeklyFrequency: 3 },
      { title: 'Write a book', desiredWeeklyFrequency: 5 },
    ])
    .returning() // O returning é para que o insert retorne os dados inseridos

  // Primeiro dia dessa semana(Domingo)
  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: result[0].id, completedAt: startOfWeek.toDate() },
    { goalId: result[1].id, completedAt: startOfWeek.add(1, 'day').toDate() }, // O add é pra adicionar um dia a mais, ou seja, segunda
  ])
}

// Finally --> Depois que terminou de executar independente de ter dado erro ou não. o then seria se tivesse dado certo
seed().finally(() => {
  client.end()
})
