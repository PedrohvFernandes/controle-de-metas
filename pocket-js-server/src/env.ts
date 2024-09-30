import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
})

// O process.env é tudo o que vem dentro do .env, quando eu executo o parse, ele vai verificar se o que está dentro do .env é igual ao que está dentro do envSchema
export const env = envSchema.parse(process.env)
