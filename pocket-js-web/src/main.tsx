import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app.tsx'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './utils'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
