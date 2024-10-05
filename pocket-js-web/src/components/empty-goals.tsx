import logo from '../assets/logo-in-orbit.svg'
import letsStart from '../assets/lets-start-illustration.svg'

import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import { DialogTrigger } from './ui/dialog'

export function EmptyGoals() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-8">
      <img src={logo} alt="Pocket Network" />
      <img src={letsStart} alt="Let's start" />
      <p className="text-zinc-300 leading-relaxed max-w-80 text-center">
        Você ainda não cadastrou nenhuma meta, que tal cadastrar um agora mesmo?
      </p>

      {/* 
      Como o DialogTrigger é um componente, é um button, vai acabar gerando um button dentro de outro button. Para que isso não aconteça, usamos o asChild, que vai passar o DialogTrigger como filho do button, e não como um button dentro de outro button.

      Com asChild, o Radix UI vai apenas "envolver" a funcionalidade do DialogTrigger no componente que você passar, sem criar um elemento adicional no DOM. E para isso de certo o componente em volta tem que estar usando o forwardRef, para que o DialogTrigger possa ser passado como filho.
    */}
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Cadastrar meta
        </Button>
      </DialogTrigger>
    </div>
  )
}
