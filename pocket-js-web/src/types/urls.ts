export const urlPrefix = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://pocket-js.vercel.app'

export const routes = {
  summary: `${urlPrefix}/summary`,
  pendingGoals: `${urlPrefix}/pending-goals`,
  completions: `${urlPrefix}/completions`,
  goals: `${urlPrefix}/goals`,
} as const
