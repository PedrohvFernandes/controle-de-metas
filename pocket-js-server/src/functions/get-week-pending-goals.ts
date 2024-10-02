import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { firstLastDayWeek } from '../utils/first-and-last-day-week'

// Ela sempre retorna a semana atual
export async function getWeekPendingGoals() {
  // Pegando a semana atual
  // const currentYear = dayjs().year()
  // const currentWeek = dayjs().week()

  const { firstDayOfWeek, lastDayOfWeek } = firstLastDayWeek()

  // Metas criadas até a semana atual. Usando with https://www.postgresql.org/docs/current/queries-with.html. Essas queries são executadas com outras queries maiores, ela não executa sozinha. Tem que tomar cuidado ao usar, porque pode gerar problema de performance. Basicamente são query menores, que vem de uma query maior, dessa forma repartimos essa query maior em varias querys(Common table), pedaços, e depois juntamos elas em uma query, executando ao mesmo tempo em uma unica instrução
  // Esse with cria uma query auxiliar temporária(Common Table) chamada goals_created_up_to_week
  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    // Selecione todas as metas dentro de goals, onde(where) a data de criação seja menor ou igual ao ultimo dia dessa semana. Ou seja, eu quero pegar todas as metas que foram criadas até a semana atual. Se eu criei uma meta semana passada, ela não vai contar nessa semana, ou seja, vai continuar 100%
    db
      .select({
        // Filtrando os campos para retornar
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      // o and para juntar as condições/verificações
      // .where(and(
      //   // Eu seleciono todas as metas onde a data de criação for menor ou igual a semana atual. Eu so quero que conte as metas que foram criadas naquela semana. Ex: Semana passada Nadar e andar 100% fiz as duas metas na semana, se eu criar outra meta semana que vem, ela não vai contar na semana passada, ou seja, vai continuar 100%
      //   // Sql é uma função do drizzle-orm que permite escrever SQL puro, comandos sql mais complexos, elaboradas. Usamos o template string do Js para passar o comando sql
      //   sql`EXTRACT()`
      // ))
      // Lte é uma função do drizzle-orm que significa "less than or equal" ou seja, menor ou igual. Ou seja, menor ou igual a ultimo dia da semana. Eu comparo o campo createdAt da tabela goals com o lastDayOfWeek
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  // Metas concluidas até a semana atual
  const goalsCompletionCounts = db.$with('goals_completion_counts').as(
    // Seleciona todos os registros da tabela goalCompletions criados nessa semana. Agrupamos por goalId, ou seja, agrupamos por meta. Se eu tenho 3 registros com o mesmo goalId, ele vai agrupar esses 3 registros em um só, onde a data de criação seja maior ou igual ao primeiro dia da semana e menor ou igual ao ultimo dia da semana. Se eu tenho 3 registros com o mesmo goalId, ele vai agrupar esses 3 registros em um só, ou seja eu fiz ela 3 vezes na semana. Por exemplo nadar 3 vezes na semana, ele vai contar 3 vezes e agrupar em um só
    db
      .select({
        goalId: goalCompletions.goalId,
        // Quantas vezes a meta foi completada nessa semana de acordo com o goalId e agrupamos por goalId
        completionCount: count(goalCompletions.id).as('completionCount'), // Sempre que eu fizer um count, somar... eu preciso dar um alias, um nome para essa agregação, para esse campo, dentro de uma common table --> As
      })
      .from(goalCompletions)
      .where(
        and(
          // Data de criação maior ou igual ao primeiro dia da semana
          gte(goalCompletions.completedAt, firstDayOfWeek),
          // Data de criação menor ou igual ao ultimo dia da semana
          lte(goalCompletions.completedAt, lastDayOfWeek)
        )
      )
      // Agrupamos por goalId, ou seja, agrupamos por meta. Se eu tenho 3 registros com o mesmo goalId, ele vai agrupar esses 3 registros em um só. Eu uso groupBy quando eu realizo um count, sum, avg, etc. Sempre que eu faço uma agregação, eu preciso agrupar por algo, por um campo
      .groupBy(goalCompletions.goalId)
  )

  // Aqui agora é uma query, que vai usar as queries auxiliares(Common Table) temporárias que foram criadas acima para pegar as metas criadas até a semana atual e as metas concluidas até a semana atual
  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalsCompletionCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      // Se eu não tiver completado nenhuma meta, eu quero que retorne 0, ou seja, ela não foi completada nenhuma vez. Caso essa variavel não exista, eu quero que retorne 0, um valor default, ou seja Caso não exista um id de alguma meta da tabela goals na tabela goalsCompletions, eu quero exibir 0 em vez de null nessa query
      // COALESCE(goals_completion_counts.completionCount, 0)
      completionCount: sql /*sql*/`
        COALESCE(${goalsCompletionCounts.completionCount}, 0)
      `.mapWith(Number), // mapWith(Number) é para converter o valor para Number, porque o retorno do sql é uma string
    })
    .from(goalsCreatedUpToWeek)
    // .toSQL().sql // Pode usar caso queira ver a query sql gerada, se estiver dando algum erro
    // Para exibir as completadas, precisamos fazer um join, cruzar dados. LeftJoin é para quando o registro da tabela goalCompletionCounts não existir, porque possa ser que o user não tenha completado nem uma meta. Mas caso não tenha completado nenhuma meta, eu quero continuar retornando ela, retornando 0, ou seja, ela não foi completada nenhuma vez. Se eu usar o innerJoin, ele só vai retornar as metas que foram completadas, ou seja, ele vai ignorar as metas que não foram completadas nenhuma vez. Então aqui eu uso o leftJoin e o eq para fazer o join, cruzar os dados, onde o goalsCompletionCounts.goalId for igual ao goalsCreatedUpToWeek.id, ou seja, os id tem que ser iguais de acordo com as query. Com isso conseguimos exibir as metas que foram completadas e as que não foram completadas. E as que foram mostramos quantas vezes foram completadas(completionCount). E dentro do select formatamos o retorno, para exibir o id, title, desiredWeeklyFrequency e completionCount
    .leftJoin(
      goalsCompletionCounts,
      eq(goalsCompletionCounts.goalId, goalsCreatedUpToWeek.id)
    )
  return {
    pendingGoals,
  }
}
