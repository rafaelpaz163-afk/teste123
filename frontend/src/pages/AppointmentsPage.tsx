import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Appointment } from '../types'
import { Calendar, Search, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { formatDate } from '../utils/format'

export default function AppointmentsPage() {
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', status],
    queryFn: async () => {
      const { data } = await api.get('/appointments', {
        params: { status: status || undefined },
      })
      return data
    },
  })

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
    CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2, label: 'Confirmado' },
    COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Concluído' },
    CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelado' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-500">Pré-cadastros e agendamentos</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === s 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {s === '' ? 'Todos' : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : data?.appointments?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum agendamento encontrado</td></tr>
              ) : (
                data?.appointments?.map((app: Appointment) => {
                  const config = statusConfig[app.status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: app.status }
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.tutor?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.pet?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.serviceType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.preferredTime || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.createdAt)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}