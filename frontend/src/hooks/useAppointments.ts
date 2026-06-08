import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useAppointments(status?: string) {
  return useQuery({
    queryKey: ['appointments', status],
    queryFn: async () => {
      const { data } = await api.get('/appointments', { params: { status } })
      return data
    },
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (appointmentData: any) => {
      const { data } = await api.post('/appointments', appointmentData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
