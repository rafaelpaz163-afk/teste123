import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, ArrowLeft } from 'lucide-react'
import { Message } from '../types'

interface ConversationChatProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  onTakeOver: () => void
  onReturnToAI: () => void
  isAiActive: boolean
  phoneNumber: string
  customerName?: string
}

export default function ConversationChat({
  messages,
  onSendMessage,
  onTakeOver,
  onReturnToAI,
  isAiActive,
  phoneNumber,
  customerName,
}: ConversationChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    onSendMessage(newMessage)
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{customerName || 'Cliente'}</h3>
            <p className="text-xs text-gray-500">{phoneNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAiActive ? (
            <button
              onClick={onTakeOver}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
            >
              <User className="h-3 w-3" />
              Assumir
            </button>
          ) : (
            <button
              onClick={onReturnToAI}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              <Bot className="h-3 w-3" />
              Devolver para IA
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'CUSTOMER' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender === 'CUSTOMER'
                  ? 'bg-gray-100 text-gray-900'
                  : message.sender === 'AI'
                  ? 'bg-blue-50 text-blue-900'
                  : 'bg-green-50 text-green-900'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {message.sender === 'AI' && <Bot className="h-3 w-3" />}
                {message.sender === 'HUMAN' && <User className="h-3 w-3" />}
                <span className="text-xs font-medium">
                  {message.sender === 'CUSTOMER' ? 'Cliente' : message.sender === 'AI' ? 'IA' : 'Atendente'}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(message.createdAt).toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isAiActive && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
