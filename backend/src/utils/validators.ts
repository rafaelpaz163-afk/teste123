import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['ADMIN', 'RECEPTIONIST']).default('RECEPTIONIST'),
});

export const tutorSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  cep: z.string().optional(),
  houseNumber: z.string().optional(),
  complement: z.string().optional(),
});

export const petSchema = z.object({
  name: z.string().min(1, 'Nome do pet é obrigatório'),
  species: z.string().min(1, 'Espécie é obrigatória'),
  breed: z.string().optional(),
  sex: z.enum(['macho', 'fêmea']),
  birthDate: z.string().datetime().optional(),
  ageApprox: z.string().optional(),
  furColor: z.string().optional(),
  isNeutered: z.boolean().optional(),
  tutorId: z.string().uuid('ID do tutor inválido'),
});

export const appointmentSchema = z.object({
  tutorId: z.string().uuid('ID do tutor inválido'),
  petId: z.string().uuid().optional(),
  serviceType: z.string().min(1, 'Tipo de serviço é obrigatório'),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
});

export const knowledgeBaseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  isManual: z.boolean().default(false),
  priority: z.number().int().default(0),
});

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nome do serviço é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  price: z.number().positive('Preço deve ser positivo'),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
});

export const aiMessageSchema = z.object({
  phoneNumber: z.string().min(10, 'Número de telefone inválido'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
});

export const whatsappWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
});
