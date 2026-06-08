import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Conversation } from '../types'
import {
  MessageSquare,
  Bot,
  User,
  Search,
  Eye,
} from 'lucide-react'
import { formatDate } from '../utils/format'

export default function ConversationsPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', status, search],
    queryFn: async () => {
      const { data } = await api.get('/conversations', {
        params: { status: status || undefined, search: search || undefined },
      })
      return data
    },
  })

  const statusColors: Record<string, string> = {
    NEW: 'bg-gray-100 text-gray-800',
    AI_HANDLING: 'bg-blue-100 text-blue-800',
    HUMAN_HANDLING: 'bg-green-100 text-green-800',
    WAITING_CUSTOMER: 'bg-yellow-100 text-yellow-800',
    FINISHED: 'bg-gray-100 text-gray-600',
  }

  const statusLabels: Record<string, string> = {
    NEW: 'Novo',
    AI_HANDLING: 'IA Atendendo',
    HUMAN_HANDLING: 'Humano Atendendo',
    WAITING_CUSTOMER: 'Aguardando Cliente',
    FINISHED: 'Finalizado',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
          <p className="text-gray-500">Gerencie todos os atendimentos</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="NEW">Novo</option>
          <option value="AI_HANDLING">IA Atendendo</option>
          <option value="HUMAN_HANDLING">Humano Atendendo</option>
          <option value="WAITING_CUSTOMER">Aguardando Cliente</option>
          <option value="FINISHED">Finalizado</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atividade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : data?.conversations?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma conversa encontrada</td></tr>
              ) : (
                data?.conversations?.map((conv: Conversation) => (
                  <tr key={conv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[conv.status]}`}>
                        {statusLabels[conv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {conv.isAiActive ? <Bot className="h-4 w-4 text-blue-500 mr-2" /> : <User className="h-4 w-4 text-green-500 mr-2" />}
                        <span className="text-sm font-medium text-gray-900">{conv.tutor?.name || 'Desconhecido'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conv.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conv._count?.messages || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(conv.lastMessageAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}