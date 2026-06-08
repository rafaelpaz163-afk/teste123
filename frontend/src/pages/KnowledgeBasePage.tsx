import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { KnowledgeBaseItem } from '../types'
import { Search, Upload, BookOpen, FileText, Plus, Trash2, Edit } from 'lucide-react'

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('')
  const [isManual, setIsManual] = useState<boolean | undefined>(undefined)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['knowledge-base', search, isManual],
    queryFn: async () => {
      const { data } = await api.get('/knowledge-base', {
        params: { search: search || undefined, isManual: isManual },
      })
      return data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conhecimento</h1>
          <p className="text-gray-500">Gerencie o treinamento da IA</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            Upload Arquivo
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            <Plus className="h-4 w-4" />
            Novo Conhecimento
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar na base de conhecimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={isManual === undefined ? '' : isManual.toString()}
          onChange={(e) => {
            const val = e.target.value
            setIsManual(val === '' ? undefined : val === 'true')
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="true">Manual</option>
          <option value="false">Arquivo</option>
        </select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum item na base de conhecimento</div>
        ) : (
          data?.items?.map((item: KnowledgeBaseItem) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {item.isManual ? (
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.isManual ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {item.isManual ? 'Manual' : 'Arquivo'}
                      </span>
                      <span className="text-xs text-gray-400">Prioridade: {item.priority}</span>
                      {item.fileName && <span className="text-xs text-gray-400">Arquivo: {item.fileName}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}