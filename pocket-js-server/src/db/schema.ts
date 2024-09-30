import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
// Ele cria um id único para cada registro no banco de dados. Usando o algorítimo cuid2.
import { createId } from '@paralleldrive/cuid2'

// Tabelas

// É preciso exportar para o Drizzle saber quais são as tabelas que devem ser criadas no banco de dados.
export const goals = pgTable('goals', {
  id: text('id')
    .primaryKey()
    // Quando colocamos isso não precisamos rodar o npx drizzle migrate para criar o id, porque essa geração de ID vai acontecer do lado do servidor
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  // Quantidade de vezes que o usuário deseja realizar a atividade por semana.
  // Dentro do aspas é o nome da coluna no banco de dados.
  desiredWeeklyFrequency: integer('desired_weekly_frequency').notNull(),
  // WithTimezone é um método que adiciona o fuso horário ao timestamp. O default now é para que o campo seja preenchido automaticamente com a data e hora atual.
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const goalCompletions = pgTable('goal_completions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  // Fk é uma chave estrangeira. O goalId é a coluna que vai ser referenciada.
  goalId: text('goal_id')
    .notNull()
    .references(() => goals.id)
    .notNull(),
  // WithTimezone é um método que adiciona o fuso horário ao timestamp. O default now é para que o campo seja preenchido automaticamente com a data e hora atual.
  completedAt: timestamp('completed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
