import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  message?: string
  icon?: React.ReactNode
}

export default function EmptyState({ message = 'Nenhum dado encontrado', icon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      {icon || <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-3" />}
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
