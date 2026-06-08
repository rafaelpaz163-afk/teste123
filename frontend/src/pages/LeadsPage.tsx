import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Lead } from '../types'
import { Target, Search, Download, RotateCcw, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { formatDate } from '../utils/format'

export default function LeadsPage() {
  const [classification, setClassification] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['leads', classification],
    queryFn: async () => {
      const { data } = await api.get('/leads', {
        params: { classification: classification || undefined },
      })
      return data
    },
  })

  const classificationConfig: Record<string, { color: string; icon: any; label: string }> = {
    INTERESTED: { color: 'bg-blue-100 text-blue-800', icon: Target, label: 'Interessado' },
    READY_TO_SCHEDULE: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Pronto para Agendar' },
    NO_RESPONSE: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Sem Resposta' },
    LOST: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Perdido' },
    RECOVERED: { color: 'bg-purple-100 text-purple-800', icon: RotateCcw, label: 'Recuperado' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">Classificação e recuperação de vendas</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'INTERESTED', 'READY_TO_SCHEDULE', 'NO_RESPONSE', 'LOST', 'RECOVERED'].map((c) => (
          <button
            key={c}
            onClick={() => setClassification(c)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              classification === c 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {c === '' ? 'Todos' : classificationConfig[c]?.label || c}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classificação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : data?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum lead encontrado</td></tr>
              ) : (
                data?.map((lead: Lead) => {
                  const config = classificationConfig[lead.classification] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: lead.classification }
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.tutor?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.tutor?.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lead.lastContact)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.tutor?.pets?.map(p => p.name).join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.classification === 'LOST' && (
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Recuperar
                          </button>
                        )}
                      </td>
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