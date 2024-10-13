import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BreedList } from './BreedList'

const App = () => {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col space-y-4 items-center h-screen p-12">
        <h1 className="text-4xl font-bold">Dog Breed List</h1>
        <BreedList />
      </div>
    </QueryClientProvider>
  )
}

export default App
