export interface Tutor {
  id: string
  name: string
  cpf?: string
  rg?: string
  birthDate?: string
  email?: string
  phone: string
  cep?: string
  houseNumber?: string
  complement?: string
  createdAt: string
  updatedAt: string
  pets?: Pet[]
}

export interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  sex: string
  birthDate?: string
  ageApprox?: string
  furColor?: string
  isNeutered?: boolean
  tutorId: string
  createdAt: string
  updatedAt: string
  tutor?: Tutor
}

export interface Conversation {
  id: string
  phoneNumber: string
  status: string
  isAiActive: boolean
  startedAt: string
  endedAt?: string
  lastMessageAt: string
  tutor?: Tutor
  assignedTo?: User
  messages?: Message[]
  _count?: { messages: number }
}

export interface Message {
  id: string
  sender: 'CUSTOMER' | 'AI' | 'HUMAN' | 'SYSTEM'
  content: string
  mediaUrl?: string
  isRead: boolean
  createdAt: string
}

export interface Appointment {
  id: string
  tutorId: string
  petId?: string
  serviceType: string
  preferredTime?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  tutor?: Tutor
  pet?: Pet
}

export interface KnowledgeBaseItem {
  id: string
  title: string
  content: string
  fileName?: string
  fileType?: string
  isManual: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  category: string
  price: number
  description?: string
  duration?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface Lead {
  id: string
  tutorId: string
  classification: string
  source: string
  lastContact: string
  followUpDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  tutor?: Tutor
}

export interface EmergencyAlert {
  id: string
  conversationId: string
  triggerWord: string
  messageContent: string
  isResolved: boolean
  createdAt: string
  resolvedAt?: string
}

export interface DashboardStats {
  conversations: { today: number; month: number }
  clients: number
  appointments: { pending: number; confirmed: number }
  emergencies: number
  avgResponseTime: any
  leads: { interested: number; ready: number; lost: number }
  topServices: { name: string; count: number }[]
  peakHours: any[]
}
