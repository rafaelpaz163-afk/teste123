import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useEmergencies() {
  return useQuery({
    queryKey: ['emergencies'],
    queryFn: async () => {
      const { data } = await api.get('/emergencies')
      return data
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useResolveEmergency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/emergencies/${id}/resolve`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] })
    },
  })
}
