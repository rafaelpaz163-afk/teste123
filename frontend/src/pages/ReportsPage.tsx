import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { BarChart3, Download, Calendar } from 'lucide-react'

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeTab, setActiveTab] = useState('conversations')

  const { data: performance, isLoading } = useQuery({
    queryKey: ['reports', 'performance', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/reports/performance', {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
      })
      return data
    },
    enabled: activeTab === 'performance',
  })

  const tabs = [
    { id: 'conversations', label: 'Conversas', icon: BarChart3 },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500">Análise e exportação de dados</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {activeTab === 'performance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da IA</h3>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total de Conversas</p>
                <p className="text-2xl font-bold text-gray-900">{performance?.totalConversations || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Atendidas por IA</p>
                <p className="text-2xl font-bold text-blue-600">{performance?.aiHandled || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Atendidas por Humano</p>
                <p className="text-2xl font-bold text-green-600">{performance?.humanHandled || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Média de Mensagens/Conversa</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(performance?.avgMessagesPerConversation || 0)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Score de Qualidade</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(performance?.qualityScores?.avg || 0)}/100</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Conversões</p>
                <p className="text-2xl font-bold text-green-600">{performance?.qualityScores?.total || 0}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}