import { CheckCircle2, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { DialogTrigger } from './ui/dialog'
// Quando transformamos o svg em componente React ele não precisa ser carregado usando internet, porque ele foi embutido direto no HTML, ele não é uma tag img, como no empty goals que carrega duas imagens. Isso para quando temos um svg pequeno.
import { InOrbitIcon } from './in-orbit-icon'
import { Progress, ProgressIndicator } from './ui/progress-bar'
import { Separator } from './ui/separator'
import { getSummary, keySummary, staleTimeSummary } from '../http'
import type { SummaryResponse } from '../types'
import { useQuery } from '@tanstack/react-query'
import { formattedDate, weekDay, time } from '../utils'
import { FormattedDate } from './formated-date'
import { PendingGoals } from './pending-goals'

export function Summary() {
  const { data, isLoading } = useQuery<SummaryResponse>({
    queryKey: [keySummary],
    queryFn: getSummary,
    // Quanto tempo a query vai ficar em cache, se passar esse tempo ele vai fazer uma nova requisição. ou seja, com quanto tempo esse dado não vai ser tornar obsoleto. Tempo obsoleto
    staleTime: staleTimeSummary,
  })

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!data) {
    return <div>Erro ao carregar</div>
  }

  const completedPercentage = Math.round((data.completed / data.total) * 100)

  return (
    <div className="py-10 max-w-[480px] px-5 mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InOrbitIcon />
          <span className="text-lg font-semibold">
            <FormattedDate />
          </span>
        </div>

        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="size-4" />
            Cadastrar Meta
          </Button>
        </DialogTrigger>
      </div>

      <div className="flex flex-col gap-3">
        <Progress value={data.completed} max={data.total}>
          <ProgressIndicator
            // Como estamos usando o tailwindCss e ele possui valores predefinidos e nós queremos fugir desses valores, usamos a propriedade style para estilizar(estilo inline). Aqui iremos fazer cálculos para o width da barra de progresso.
            style={{
              width: `${completedPercentage}%`,
            }}
          />
        </Progress>

        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Você completou{' '}
            <span className="text-zinc-100">{data.completed}</span> de
            <span className="text-zinc-100">{data.total}</span> metas nessa
            semana.
          </span>
          <span>{completedPercentage}%</span>
        </div>

        <Separator />

        <PendingGoals />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-medium">Sua Semana:</h2>
        {/* 
          O entries ele me da acesso a chave e valor de um objeto, e eu posso fazer um map em cima disso, porque vira um array de arrays. Com duas posições, a primeira é a chave e a segunda é o valor dessa chave, que foi transformado em string.
          
          Ou seja, eu pego um objeto(goalsPerDay), dentro desse objeto em especifico tem objetos com chave(que são datas:2024-09-29) e valor, onde esse valor deles está no formato de um array de objetos que não possuem chave alguma, mas com os seguinte valores: id, title, completedAt, etc. A chave dos objetos contidos dentro do objeto goalsPerDay se transformam em uma string e conseguimos ter acesso ao valor especifico dessa chave, porque o objeto goalsPerDay foi transformado em um array, com duas posições, e acessamos essas duas posições usando o map, desestruturando o array, e pegando a chave e o valor(day, goals).
        */}
        {Object.entries(data.goalsPerDay).map(([day, goals]) => {
          return (
            <div className="flex flex-col gap-4" key={day}>
              <h3 className="font-medium">
                <span className="capitalize"> {weekDay(day)} </span>
                <span className="text-zinc-400 text-xs">
                  ({formattedDate(day)})
                </span>
              </h3>

              <ul className="flex flex-col gap-3">
                {goals.map(goal => {
                  return (
                    <li className="flex items-center gap-2" key={goal.id}>
                      <CheckCircle2 className="size-4 text-pink-500" />
                      <span className="text-sm text-zinc-400">
                        Você completou “
                        <span className="text-zinc-100">{goal.title}</span>” às{' '}
                        <span className="text-zinc-100">
                          {time(goal.completedAt)}h
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
