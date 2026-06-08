# ESPECIFICAÇÃO TÉCNICA COMPLETA
## Agente de IA para Clínica Veterinária via WhatsApp

### Versão: 1.0.0
### Data: 2026-06-08

---

## 1. ARQUITETURA DO SISTEMA

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FRONTEND      │────▶│    BACKEND      │────▶│   WHATSAPP BOT  │
│  (React/Next)   │     │   (Node.js)     │     │  (Evolution API)│
│  Painel Admin   │     │   API REST      │     │  Webhook Handler│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │              ┌──────┴──────┐               │
         │              │   DATABASE  │               │
         │              │ (PostgreSQL)│               │
         │              │   + Redis   │               │
         │              └─────────────┘               │
         │                       │
         │              ┌──────┴──────┐
         │              │    OPENAI   │
         │              │   (GPT-4)   │
         │              └─────────────┘
         │
         │              ┌──────┴──────┐
         └─────────────▶│   SUPABASE  │
                        │  (Storage)  │
                        └─────────────┘
```

---

## 2. STACK TECNOLÓGICO

### Backend
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Queue**: BullMQ (Redis-based)
- **Auth**: JWT + bcrypt
- **Validação**: Zod
- **Documentação**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Query Client**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

### WhatsApp Integration
- **API**: Evolution API (open-source WhatsApp Business alternative)
- **Webhooks**: Express webhook handlers
- **Media**: Base64 encoding for images/documents

### AI/ML
- **LLM**: OpenAI GPT-4 / GPT-4o-mini
- **Embeddings**: text-embedding-3-small
- **Vector DB**: pgvector (PostgreSQL extension)
- **RAG**: Custom implementation with similarity search

### DevOps
- **Container**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt (certbot)
- **Monitoring**: Basic logging (Winston)
- **Backup**: Automated pg_dump + cron

---

## 3. MODELO DE DADOS (Prisma Schema)

### Entidades Principais

```prisma
// User (Admin/Recepcionista)
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String   // bcrypt hash
  name        String
  role        Role     @default(RECEPTIONIST)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  conversations Conversation[]
  auditLogs     AuditLog[]

  @@map("users")
}

enum Role {
  ADMIN
  RECEPTIONIST
}

// Tutor (Cliente)
model Tutor {
  id            String   @id @default(uuid())
  name          String
  cpf           String?  @unique
  rg            String?
  birthDate     DateTime?
  email         String?
  phone         String   // WhatsApp number (primary key for chat)
  cep           String?
  houseNumber   String?
  complement    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  pets          Pet[]
  conversations Conversation[]
  appointments  Appointment[]

  @@map("tutors")
}

// Pet
model Pet {
  id              String   @id @default(uuid())
  name            String
  species         String   // cão, gato, etc
  breed           String?
  sex             String   // macho, fêmea
  birthDate       DateTime?
  ageApprox       String?
  furColor        String?
  isNeutered      Boolean?
  tutorId         String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  tutor           Tutor    @relation(fields: [tutorId], references: [id])
  appointments    Appointment[]

  @@map("pets")
}

// Conversation (Chat Session)
model Conversation {
  id              String           @id @default(uuid())
  tutorId         String?
  tutor           Tutor?           @relation(fields: [tutorId], references: [id])
  phoneNumber     String           // WhatsApp number
  status          ConversationStatus @default(NEW)
  isAiActive      Boolean          @default(true)
  assignedToId    String?
  assignedTo      User?            @relation(fields: [assignedToId], references: [id])
  startedAt       DateTime         @default(now())
  endedAt         DateTime?
  lastMessageAt   DateTime         @default(now())

  // Relations
  messages        Message[]

  @@map("conversations")
}

enum ConversationStatus {
  NEW
  AI_HANDLING
  HUMAN_HANDLING
  WAITING_CUSTOMER
  FINISHED
}

// Message
model Message {
  id              String   @id @default(uuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  sender          MessageSender
  content         String   @db.Text
  mediaUrl        String?
  isRead          Boolean  @default(false)
  createdAt       DateTime @default(now())

  @@map("messages")
}

enum MessageSender {
  CUSTOMER
  AI
  HUMAN
  SYSTEM
}

// Appointment (Pré-cadastro)
model Appointment {
  id              String   @id @default(uuid())
  tutorId         String
  tutor           Tutor    @relation(fields: [tutorId], references: [id])
  petId           String?
  pet             Pet?     @relation(fields: [petId], references: [id])
  serviceType     String
  preferredTime   String?
  status          AppointmentStatus @default(PENDING)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("appointments")
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

// Knowledge Base
model KnowledgeBase {
  id          String   @id @default(uuid())
  title       String
  content     String   @db.Text
  fileName    String?
  fileType    String?  // PDF, CSV, XLSX, DOCX, TXT
  fileUrl     String?
  isManual    Boolean  @default(false) // true = manual training, false = file import
  priority    Int      @default(0) // Higher = more priority
  embedding   Unsupported("vector(1536)")? // pgvector
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("knowledge_base")
}

// Service/Price Table
model Service {
  id          String   @id @default(uuid())
  name        String
  category    String   // consulta, vacina, cirurgia, etc
  price       Decimal  @db.Decimal(10, 2)
  description String?  @db.Text
  duration    Int?     // minutes
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("services")
}

// Audit Log
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  action      String   // LOGIN, LOGOUT, AI_TOGGLE, etc
  description String   @db.Text
  ipAddress   String?
  createdAt   DateTime @default(now())

  @@map("audit_logs")
}

// Lead Classification
model Lead {
  id              String       @id @default(uuid())
  tutorId         String
  tutor           Tutor        @relation(fields: [tutorId], references: [id])
  classification  LeadStatus   @default(INTERESTED)
  source          String       // conversation, manual, etc
  lastContact     DateTime     @default(now())
  followUpDate    DateTime?
  notes           String?      @db.Text
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@map("leads")
}

enum LeadStatus {
  INTERESTED
  READY_TO_SCHEDULE
  NO_RESPONSE
  LOST
  RECOVERED
}

// System Config
model SystemConfig {
  id              String   @id @default(uuid())
  key             String   @unique
  value           String   @db.Text
  category        String   // ai, whatsapp, business, etc
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("system_configs")
}

// Emergency Alert
model EmergencyAlert {
  id              String   @id @default(uuid())
  conversationId  String
  triggerWord     String
  messageContent  String   @db.Text
  isResolved      Boolean  @default(false)
  createdAt       DateTime @default(now())
  resolvedAt      DateTime?

  @@map("emergency_alerts")
}

// Daily Backup
model Backup {
  id          String   @id @default(uuid())
  fileName    String
  fileSize    Int      // bytes
  fileUrl     String
  status      String   // SUCCESS, FAILED
  createdAt   DateTime @default(now())

  @@map("backups")
}
