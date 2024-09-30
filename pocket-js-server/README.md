# Projeto Pocket


### Scripts

```JSON
{
  "scripts": {
    ...
    // o --env-file .env é para carregar as variáveis de ambiente, isso já esta nativo no node
    "dev": "tsx watch --env-file .env src/http/server.ts",
    // Executamos o comando para rodar o banco de dados, para popularizar o banco de dados com infos
    "seed": "tsx --env-file .env src/db/seed.ts"
  }
}
```

Para rodar o banco de dados e as migrations quando mudar algo no schema: Usando o docker-compose e o drizzle-kit/orm
- `docker-compose up -d`
- npx drizzle-kit generate
- npx drizzle-kit migrate
- npx drizzle-kit studio

Se der esse erro ao testar a Api:
```
{
	"statusCode": 500,
	"code": "ECONNREFUSED",
	"error": "Internal Server Error",
	"message": ""
}
```
É porque o banco de dados não está rodando, então rode o comando `docker-compose up -d` e tente novamente.


Caso queira testar um SQL ou uma instrução sql no formato drizzle: De um npm run bd:studio e cole o código no studio:
```SQL runner
  with "goals_created_up_to_week" as (select "id", "title", "desired_weekly_frequency", "created_at" from "goals" where "goals"."created_at" <= $1), "goals_completion_counts" as (select "goal_id", count("id") from "goal_completions" where ("goal_completions"."completed_at" >= $2 and "goal_completions"."completed_at" <= $3) group by "goal_completions"."goal_id") select "id", "title", "desired_weekly_frequency", "created_at" from "goals_created_up_to_week"
```
Caso não rode, so pedir pro ChatGpt formatar o código para rodar:
```SQL runner
WITH "goals_created_up_to_week" AS (
    SELECT 
        "id", 
        "title", 
        "desired_weekly_frequency", 
        "created_at" 
    FROM 
        "goals" 
    WHERE 
        "goals"."created_at" <= $1
),
"goals_completion_counts" AS (
    SELECT 
        "goal_id", 
        COUNT("id") 
    FROM 
        "goal_completions" 
    WHERE 
        "goal_completions"."completed_at" >= $2 
        AND "goal_completions"."completed_at" <= $3
    GROUP BY 
        "goal_completions"."goal_id"
)
SELECT 
    "id", 
    "title", 
    "desired_weekly_frequency", 
    "created_at" 
FROM 
    "goals_created_up_to_week";
```
ou
```ts Drizzle runner
  const sql = await db
    .with(goalsCreatedUpToWeek, goalsCompletionCounts)
    .select()
    .from(goalsCreatedUpToWeek)
```