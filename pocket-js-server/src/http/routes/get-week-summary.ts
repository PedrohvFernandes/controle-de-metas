import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekSummary } from '../../functions/get-week-summary'

// Resumo semanal por dias da semana, hoje, ontem, data 28/09, etc. Poderiamos fazer isso no frontend, mas para aprender sql, irei fazer por aqui. Sera feito query agrupados por data. Agregação de dados dentro do Sql
export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
  app.get('/summary', async () => {
    const pendingGoals = await getWeekSummary()

    return pendingGoals
  })
}
