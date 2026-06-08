import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { Power, MessageSquare, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: ['ai-config'],
    queryFn: async () => {
      const { data } = await api.get('/ai-config/status')
      return data
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await api.post('/ai-config/toggle', { enabled })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-config'] })
      toast.success('Configuração atualizada!')
    },
    onError: () => toast.error('Erro ao atualizar configuração'),
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put('/ai-config/status', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-config'] })
      toast.success('Configuração salva!')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie o comportamento da IA</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Power className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Status da IA</h3>
              <p className="text-sm text-gray-500">Ligar ou desligar o atendimento automático</p>
            </div>
          </div>
          <button
            onClick={() => toggleMutation.mutate(!config?.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config?.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config?.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Mensagens da IA</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Saudação Inicial</label>
          <textarea
            defaultValue={config?.greeting}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Fallback</label>
          <textarea
            defaultValue={config?.fallbackMessage}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Emergência</label>
          <textarea
            defaultValue={config?.emergencyMessage}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => updateMutation.mutate({
            greeting: config?.greeting,
            fallbackMessage: config?.fallbackMessage,
            emergencyMessage: config?.emergencyMessage,
          })}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Salvar Mensagens
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Horário de Funcionamento</h3>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            defaultValue={config?.workingHours}
            placeholder="08:00-18:00"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}