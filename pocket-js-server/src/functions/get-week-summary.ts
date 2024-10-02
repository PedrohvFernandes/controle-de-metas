import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { firstLastDayWeek } from '../utils/first-and-last-day-week'

export async function getWeekSummary() {
  const { firstDayOfWeek, lastDayOfWeek } = firstLastDayWeek()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalsCompletedInWeek = db.$with('goals_completed_in_week').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        // Temos que fazer o agrupamento por datas, para saber se por exemplo na quinta feira, quais foram as metas completadas. O problema é que essa data pega o horario, então temos que fazer algo  para pegar apenas a data, para agrupar as metas que foram completadas no mesmo dia
        // createdAt: goalCompletions.completedAt,
        // Essa função Date no sql arranca o horário e deixa apenas a data
        completedAtDate: sql /*sql*/`
          DATE(${goalCompletions.completedAt})
        `.as('completedAtDate'), // Como esse campo não existe no banco(quando fazemos uma agregação ou usamos função sql), temos que dar um nome As
        // Precisamos do horario separado para saber quando uma meta foi completada
        completedAt: goalCompletions.completedAt, // Aqui tem a data com horario
      })
      .from(goalCompletions)
      // O innerJoin é porque queremos que os dois lados da relação existam, ou seja, que a goal exista e que a goalCompletion exista. Vai retornar apenas os que tem os dois lados da relação
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.completedAt, firstDayOfWeek),
          lte(goalCompletions.completedAt, lastDayOfWeek)
        )
      )
  )

  // Essa common table expression é para pegar os dados da cte  goalsCompletedInWeek e vai agrupar os dados pela data. Porque é o que precisamos, dos dados agrupados por data: 05/09/2024, 06/09/2024, etc. Um resumo por dia.
  const goalsCompletedByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        // Vamos fazer uma agregação em formato JSON. Porque o que a cte que estamos usando ela retorna uma informação no formato sql, em linhas e colunas. Mas queremos um objeto: E isso é agregação dentro do sql, é eu pegar uma lista e converter em um objeto, e fazemos isso com a função JSON_AGG
        /*
          Formato que vai chegar:
            1, "Nadar", "2024-09-05", "2024-09-05 10:00:00"
            2, "Correr", "2024-09-05", "2024-09-05 11:00:00"

            3, "Nadar", "2024-09-06", "2024-09-06 10:00:00"
            4, "Correr", "2024-09-06", "2024-09-06 11:00:00"
          
          Aí são dois dias diferentes, como que queremos que chegue:

          summary: [
            {
              "completedAtDate": "2024-09-05",
              "completions": [
                {
                  "id": 1,
                  "title": "Nadar",
                  "completedAt": "2024-09-05 10:00:00"
                },
                {
                  "id": 2,
                  "title": "Correr",
                  "completedAt": "2024-09-05 11:00:00"
                }
              ],
            },
            {
              "completedAtDate": "2024-09-06",
              "completions": [
                {
                  "id": 3,
                  "title": "Nadar",
                  "completedAt": "2024-09-06 10:00:00"
                },
                {
                  "id": 4,
                  "title": "Correr",
                  "completedAt": "2024-09-06 11:00:00"
                }
              ],
            }
          ]
        */
        // JSON_AGG() é para agregar os objetos em um array. Um retorno de linhas e colunas, para um array. E esse agrupamento é feito pela completedAtDate, vai ser varias infos agrupadas por data.
        //  JSON_BUILD_OBJECT é para criar um objeto, e dentro dele passamos os campos que queremos. Por isso usamos esse JSON_BUILD_OBJECT, para criar um objeto com os campos que queremos parta ficar dentro do array gerado pelo JSON_AGG.
        /*
          JSON_AGG(completions): [
            JSON_BUILD_OBJECT:{
              'id', 1,
              'title', "Nadar",
              'completedAt', "2024-09-05 10:00:00"
            },
          ]
        */
        completions: sql /*sql*/`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInWeek.id},
              'title', ${goalsCompletedInWeek.title},
              'completedAt', ${goalsCompletedInWeek.completedAt}
            )
          )
        `.as('completions'), // O as é para dar um nome para o campo
      })
      // Vamos pegar os dados da cte goalsCompletedInWeek
      .from(goalsCompletedInWeek)
      // Agrupamos os dados pela data
      .groupBy(goalsCompletedInWeek.completedAtDate)
  )

  const result = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      // Metas que eu conclui no total
      // O sql aqui ele faz um count de todas as metas que foram completadas
      completed: sql /*sql*/`
        (SELECT COUNT(*) FROM ${goalsCompletedInWeek})
      `
        .mapWith(Number)
        .as('completed'),
      // Metas que eu criei no total usando o campo desiredWeeklyFrequency, porque por exemplo nada 2 vezes e caminhas 2, no total tem que ser 4
      total: sql /*sql*/`
        (SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})
      `
        .mapWith(Number)
        .as('total'),
      // Como estamos indo no cte goalsCompletedByWeekDay, que é um array de metas completadas por dia, temos que fazer um agrupamento, porque se não, essa query vai retornar um array com objetos duplicados, o mesmo total e o mesmo completed, por conta que temos metas completadas em dias diferentes, e a query goalsCompletedByWeekDay retorna isso pra gente, logo essa query vai acompanhar a quantidade de objetos que foram completados em cada dia e mostrar isso no resultado final. Com esse agrupamento mostra um array com total, completed e objetos das metas concluídas por dia.
      // JSON_OBJECT_AGG eu crio um objeto.
      /* 
        No fim retornamos um objeto goalsPerDay, onde a data é a chave e o valor é um array de metas(objetos) completadas naquele dia. E isso é feito com a função JSON_OBJECT_AGG
          ${goalsCompletedByWeekDay.completedAtDate} --> chave
          ${goalsCompletedByWeekDay.completions} --> valor
        {
          "2024-09-05": [
            {
              "id": 1,
              "title": "Nadar",
              "completedAt": "2024-09-05 10:00:00"
            },
            {
              "id": 2,
              "title": "Correr",
              "completedAt": "2024-09-05 11:00:00"
            }
          ],
          "2024-09-06": [
            {
              "id": 3,
              "title": "Nadar",
              "completedAt": "2024-09-06 10:00:00"
            },
            {
              "id": 4,
              "title": "Correr",
              "completedAt": "2024-09-06 11:00:00"
            }
          ]

          E claro mais em cima vem o completed, total...
      */
      goalsPerDay: sql /*sql*/`
        JSON_OBJECT_AGG(
          ${goalsCompletedByWeekDay.completedAtDate},
          ${goalsCompletedByWeekDay.completions}
        )
      `,
    })
    .from(goalsCompletedByWeekDay)

  return {
    summary: result,
  }
}
