import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Pet } from '../types'
import { Search, Plus, PawPrint } from 'lucide-react'

export default function PetsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['pets', search],
    queryFn: async () => {
      const { data } = await api.get('/pets', {
        params: { search: search || undefined },
      })
      return data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
          <p className="text-gray-500">Gerencie os animais atendidos</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          <Plus className="h-4 w-4" />
          Novo Pet
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, espécie ou raça..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Carregando...</div>
        ) : data?.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">Nenhum pet encontrado</div>
        ) : (
          data?.map((pet: Pet) => (
            <div key={pet.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <PawPrint className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{pet.name}</h3>
                  <p className="text-sm text-gray-500">{pet.species} {pet.breed && `- ${pet.breed}`}</p>
                  <p className="text-xs text-gray-400 mt-1">Tutor: {pet.tutor?.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {pet.sex === 'macho' ? '♂' : '♀'} {pet.sex}
                    </span>
                    {pet.isNeutered !== undefined && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${pet.isNeutered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {pet.isNeutered ? 'Castrado' : 'Fértil'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}