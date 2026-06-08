import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useLeads(classification?: string) {
  return useQuery({
    queryKey: ['leads', classification],
    queryFn: async () => {
      const { data } = await api.get('/leads', { params: { classification } })
      return data
    },
  })
}

export function useRecoverLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/leads/${id}/recover`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
