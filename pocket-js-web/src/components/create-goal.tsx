import { X } from 'lucide-react'
import { Button } from './ui/button'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog'
import {
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
} from './ui/radio-group'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGoal, keyPendingGoals, keySummary } from '../http'
import { queryClient } from '../utils'

const creteGoalForm = z.object({
  title: z.string().min(1, 'Informe a atividade que deseja realizer'),
  // O coerce serve para que o valor seja coerido para o tipo number.
  desiredWeeklyFrequency: z.coerce.number().int().min(1).max(7),
})

// type CreateGoalForm = {
//   title: string
//   desiredWeeklyFrequency: number
// }
type CreateGoalForm = z.infer<typeof creteGoalForm>

export function CreateGoal() {
  // Control é um objeto que tenho dentro varias funções que eu posso acessar dentro do meu forms
  const { register, control, handleSubmit, formState, reset } =
    useForm<CreateGoalForm>({
      resolver: zodResolver(creteGoalForm),
    })

  async function handleCreateGoal(data: CreateGoalForm) {
    await createGoal({
      title: data.title,
      desiredWeeklyFrequency: data.desiredWeeklyFrequency,
    })

    queryClient.invalidateQueries({
      queryKey: [keySummary],
    })

    queryClient.invalidateQueries({
      queryKey: [keyPendingGoals],
    })

    reset()
  }

  return (
    <DialogContent>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <DialogTitle>Cadastrar Meta</DialogTitle>
            <DialogClose>
              <X className="size-5 text-zinc-600" />
            </DialogClose>
          </div>

          <DialogDescription>
            Adicione atividades que te fazem bem e que você quer continuar
            praticando toda semana.
          </DialogDescription>
        </div>
        {/* 
        flex-1 --> Flex grow 1, para que o formulário ocupe todo o espaço disponível, todo espaço de altura do meu dialog. Flex shrink 1, para que o formulário não encolha mais do que o necessário e flex basis 0, para que o formulário não tenha um tamanho base.
    */}
        <form
          onSubmit={handleSubmit(handleCreateGoal)}
          className="flex-1 flex flex-col justify-between"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Qual a atividade?</Label>
              <Input
                id="title"
                autoFocus
                placeholder="Praticar exercícios, meditar, etc..."
                // So pode usamos essa sintaxe aqui dentro de um input nativo do HTML
                {...register('title')}
              />
              {formState.errors.title && (
                <p className="text-sm text-red-400">
                  {formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Quantas vezes na semana?</Label>
              {/* 
                  Dessa forma tenho controle de um campo que não é nativo do HTML
              */}
              <Controller
                control={control}
                name="desiredWeeklyFrequency"
                // Ja vem setado como 1 no radio group
                defaultValue={1}
                // O field me da acesso a modificar o valor do campo manualmente
                render={({ field }) => {
                  return (
                    // onValueChange ->> Vai disparar quando o valor do campo for alterado, quando o usuario clicar em alguma das opções do radio group, passamos o field.onChange que nada mais é que o onChange desse campo, que vai alterar o seu valor quando o usuario mudar. E o value vai ser o valor atual do campo.
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={String(field.value)}
                    >
                      <RadioGroupItem value="1">
                        <RadioGroupIndicator />
                        <span className="text-zinc-300 text-sm font-medium leading-none">
                          1x na Semana
                        </span>
                        <span className="text-lg leading-none">🥱</span>
                      </RadioGroupItem>
                      <RadioGroupItem value="2">
                        <RadioGroupIndicator />
                        <span className="text-zinc-300 text-sm font-medium leading-none">
                          2x na Semana
                        </span>
                        <span className="text-lg leading-none">🙂</span>
                      </RadioGroupItem>
                      <RadioGroupItem value="3">
                        <RadioGroupIndicator />
                        <span className="text-zinc-300 text-sm font-medium leading-none">
                          3x na Semana
                        </span>
                        <span className="text-lg leading-none">😎</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="4">
                        <RadioGroupIndicator />
                        <span className="text-zinc-300 text-sm font-medium leading-none">
                          4x na Semana
                        </span>
                        <span className="text-lg leading-none">😜</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="5">
                        <RadioGroupIndicator />
                        <span className="text-zinc-300 text-sm font-medium leading-none">
                          5x na Semana
                        </span>
                        <span className="text-lg leading-none">🤨</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="6">
                        <RadioGroupIndicator />
                        <span className="text-zinc-300 text-sm font-medium leading-none">
                          6x na Semana
                        </span>
                        <span className="text-lg leading-none">🤯</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="7">
                        <RadioGroupIndicator />
                        <span className="text-zinc-300 text-sm font-medium leading-none">
                          Todos Todos dias da semana
                        </span>
                        <span className="text-lg leading-none">🔥</span>
                      </RadioGroupItem>
                    </RadioGroup>
                  )
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 
            Flex-1 mesma logica do forms, vai ocupar o maximo de espaço disponivel, mas não vai encolher mais do que o necessário. Se o flex for row entao vai ocupar o width, se for column vai ocupar o height.

            Se colocar flex-1 nos dois buttons, eles vão ocupar o mesmo espaço, mas se colocar flex-1 apenas em um, ele vai ocupar o espaço restante.
          */}
            <DialogClose asChild>
              <Button type="button" className="flex-1" variant="secondary">
                Fechar
              </Button>
            </DialogClose>
            <Button className="flex-1">Cadastrar</Button>
          </div>
        </form>
      </div>
    </DialogContent>
  )
}
