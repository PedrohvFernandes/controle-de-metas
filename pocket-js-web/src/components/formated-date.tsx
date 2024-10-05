import { firstDayOfWeek, formatSplit, lastDayOfWeek, month } from '../utils'

export function FormattedDate() {
  const currentMonth = (
    // Se for o mesmo mês, exibe o nome do mes grande e somente os dias: 05 a 12 de Agosto
    <span>
      {formatSplit().firstDayOfWeekDay} a {formatSplit().lastDayOfWeekDay} de{' '}
      <span className="capitalize">{month}</span>
    </span>
  )

  const notCurrentMonth = (
    // Se não for o mesmo mês, exibe o nome do mês grande e os dias: 29 de Agosto a 05 de Setembro
    <span>
      <span className="capitalize">{firstDayOfWeek}</span> a{' '}
      <span className="capitalize">{lastDayOfWeek}</span>
    </span>
  )

  return (
    <>
      {formatSplit().firstDayOfWeekMonth === formatSplit().lastDayOfWeekMonth
        ? currentMonth
        : notCurrentMonth}
    </>
  )
}
