export type SummaryResponse = {
  completed: number
  total: number
  goalsPerDay: Record<
    string,
    {
      id: number
      title: string
      completedAt: string
    }[]
  >
}
