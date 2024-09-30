import { defineConfig } from 'drizzle-kit'
import { env } from './src/env'

export default defineConfig({
  schema: './src/db/schema.ts', // Onde o esquema do banco de dados será definido.
  // Onde os arquivos de migração serão gerados.Que são os arquivos da linha do tempo do banco de dados.
  out: './.migrations', // .migrations é o diretório padrão onde as migrações serão salvas. Tem um Ponto pra ficar no topo do projeto.
  dialect: 'postgresql',
  dbCredentials: {
    // Onde as credenciais do banco de dados estão armazenadas.
    url: env.DATABASE_URL,
  },
})
