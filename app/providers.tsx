'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - données considérées fraîches pendant 1 min
        gcTime: 5 * 60 * 1000, // 5 minutes - cache gardé 5 min après inactivité
        refetchOnWindowFocus: false, // Pas de refetch automatique au focus
        retry: 1, // 1 seule tentative en cas d'erreur
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

