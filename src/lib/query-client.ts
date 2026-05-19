import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,              // si falla una query, reintenta 1 vez
      staleTime: 1000 * 60,  // los datos se consideran frescos por 1 minuto
                             // en ese tiempo no hace refetch aunque cambies de página
      refetchOnWindowFocus: false, // no refetch al volver a la pestaña
    },
  },
})