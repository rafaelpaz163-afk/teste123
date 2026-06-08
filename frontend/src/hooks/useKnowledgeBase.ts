import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useKnowledgeBase(search?: string, isManual?: boolean) {
  return useQuery({
    queryKey: ['knowledge-base', search, isManual],
    queryFn: async () => {
      const { data } = await api.get('/knowledge-base', { params: { search, isManual } })
      return data
    },
  })
}

export function useUploadKnowledgeFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/knowledge-base/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
    },
  })
}
