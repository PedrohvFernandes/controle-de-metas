import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

export const firstLastDayWeek = () => {
  // Ele pega o primeiro dia da semana atual
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  // Pegando o ultimo dia da semana atual
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  return { firstDayOfWeek, lastDayOfWeek }
}
