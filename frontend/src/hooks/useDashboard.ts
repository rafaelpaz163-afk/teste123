import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { DashboardStats } from '../types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats')
      return data as DashboardStats
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}
