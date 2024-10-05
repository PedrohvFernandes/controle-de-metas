import { Dialog } from './components/ui/dialog'
import { CreateGoal } from './components/create-goal'
import { Summary } from './components/summary'
import { EmptyGoals } from './components/empty-goals'
import { useQuery } from '@tanstack/react-query'
import type { SummaryResponse } from './types'
import { getSummary, keySummary, staleTimeSummary } from './http'

export function App() {
  // const [summary, setSummary] = useState<SummaryResponse | null>(null)

  // useEffect(() => {
  //   fetch('http://localhost:3000/summary')
  //     .then(response => response.json())
  //     .then(data => {
  //       setSummary(data.summary)
  //     })
  // }, [])

  const { data, isLoading } = useQuery<SummaryResponse>({
    queryKey: [keySummary], // Identificador da query, dessa req
    queryFn: getSummary,
    // Fazendo isso, se alguma outra parte da aplicação fizer uma requisição para o mesmo endpoint, ele vai pegar o dado que já está em cache, e não vai fazer uma nova requisição.
    staleTime: staleTimeSummary,
  })

  return (
    <Dialog>
      {data?.total && data?.total > 0 ? <Summary /> : <EmptyGoals />}
      <CreateGoal />
    </Dialog>
  )
}
