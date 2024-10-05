import dayjs from 'dayjs'
import ptBR from 'dayjs/locale/pt-BR'

dayjs.locale(ptBR)

// Format: 1 Jan
export const firstDayOfWeek = dayjs().startOf('week').format('D MMM')

// Format: 7 Jan
export const lastDayOfWeek = dayjs().endOf('week').format('D MMM')

export const month = dayjs().format('MMMM')

export const formatSplit = () => {
  const splitFirstDayOfWeek = firstDayOfWeek.split(' ')
  const splitLastDayOfWeek = lastDayOfWeek.split(' ') // ['7', 'Jan']

  // Pegamos o dia da semana do primeiro dia da semana e do último dia da semana
  const firstDayOfWeekDay = splitFirstDayOfWeek[0]
  const lastDayOfWeekDay = splitLastDayOfWeek[0]

  // Pegamos o mês do primeiro dia da semana e do último dia da semana
  const firstDayOfWeekMonth = splitFirstDayOfWeek[1]
  const lastDayOfWeekMonth = splitLastDayOfWeek[1]

  return {
    firstDayOfWeekDay,
    lastDayOfWeekDay,
    firstDayOfWeekMonth,
    lastDayOfWeekMonth,
  }
}

export const weekDay = (date: string) => {
  return dayjs(date).format('dddd')
}

export const formattedDate = (date: string) => {
  // Colchete é para que o que colocarmos dentro dele, seja exibido como está e não formatado pelo dayjs
  return dayjs(date).format('D[ de ]MMMM')
}

export const time = (date: string) => {
  return dayjs(date).format('HH:mm')
}
