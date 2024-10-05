import { routes, type SummaryResponse } from '../types'

export async function getSummary(): Promise<SummaryResponse> {
  const response = await fetch(routes.summary)
  const data = await response.json()

  return data.summary
}

export const keySummary = 'summary'

export const staleTimeSummary = 1000 * 60 // 60 seconds // se colocar mais um * 5, // 5 minutos.
