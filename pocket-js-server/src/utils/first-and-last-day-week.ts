import dayjs from 'dayjs'

export const firstLastDayWeek = () => {
  // Ele pega o primeiro dia da semana atual
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  // Pegando o ultimo dia da semana atual
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  return { firstDayOfWeek, lastDayOfWeek }
}
