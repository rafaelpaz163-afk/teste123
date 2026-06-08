import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { DashboardStats } from '../types'
import {
  MessageSquare,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { formatDate } from '../utils/format'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats')
      return data as DashboardStats
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const cards = [
    {
      title: 'Conversas Hoje',
      value: stats?.conversations.today || 0,
      icon: MessageSquare,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Conversas Mês',
      value: stats?.conversations.month || 0,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Clientes',
      value: stats?.clients || 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Agendamentos Pendentes',
      value: stats?.appointments.pending || 0,
      icon: Calendar,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Emergências Hoje',
      value: stats?.emergencies || 0,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'Leads Prontos',
      value: stats?.leads.ready || 0,
      icon: Clock,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços Mais Procurados</h3>
        <div className="space-y-3">
          {stats?.topServices?.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{service.name}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-blue-100 rounded-full w-32">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${Math.min((service.count / (stats.topServices[0]?.count || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{service.count}</span>
              </div>
            </div>
          )) || <p className="text-gray-500">Nenhum dado disponível</p>}
        </div>
      </div>
    </div>
  )
}