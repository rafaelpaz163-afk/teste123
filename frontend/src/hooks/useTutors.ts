import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useTutors(search?: string) {
  return useQuery({
    queryKey: ['tutors', search],
    queryFn: async () => {
      const { data } = await api.get('/tutors', { params: { search } })
      return data
    },
  })
}

export function useCreateTutor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tutorData: any) => {
      const { data } = await api.post('/tutors', tutorData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] })
    },
  })
}
