import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'
// https://www.youtube.com/watch?v=BhPyF0BQpF0 --> Como escalar um projeto usando tailwindCss
// https://www.rocketseat.com.br/blog/artigos/post/3-dicas-para-estilizacao-de-projetos-react-com-tailwind
export function Separator(props: ComponentProps<'div'>) {
  return (
    <div {...props} className={twMerge('h-px bg-zinc-900', props.className)} />
  )
}
