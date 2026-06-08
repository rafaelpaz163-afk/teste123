import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { EmergencyAlert } from '../types'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { formatDate } from '../utils/format'

export default function EmergenciesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['emergencies'],
    queryFn: async () => {
      const { data } = await api.get('/emergencies')
      return data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emergências</h1>
        <p className="text-gray-500">Alertas de emergência detectados pela IA</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : data?.alerts?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhuma emergência registrada</div>
        ) : (
          data?.alerts?.map((alert: EmergencyAlert) => (
            <div key={alert.id} className={`rounded-lg shadow p-4 ${alert.isResolved ? 'bg-white' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.isResolved ? 'bg-green-100' : 'bg-red-100'}`}>
                    {alert.isResolved ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900">Alerta de Emergência</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${alert.isResolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {alert.isResolved ? 'Resolvido' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Palavra-chave: <span className="font-medium">{alert.triggerWord}</span></p>
                    <p className="text-sm text-gray-500 mt-1">{alert.messageContent}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(alert.createdAt)}
                    </div>
                  </div>
                </div>
                {!alert.isResolved && (
                  <button className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolver
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}