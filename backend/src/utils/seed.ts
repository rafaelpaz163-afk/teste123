import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário admin padrão
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@vetclinic.com' },
  })

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    await prisma.user.create({
      data: {
        email: 'admin@vetclinic.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
      },
    })
    console.log('✅ Usuário admin criado: admin@vetclinic.com / admin123')
  }

  // Criar serviços de exemplo
  const services = [
    { name: 'Consulta Clínica', category: 'consulta', price: 120.00, description: 'Consulta geral com veterinário', duration: 30 },
    { name: 'Vacina V8/V10', category: 'vacina', price: 85.00, description: 'Vacinação polivalente', duration: 15 },
    { name: 'Vacina Antirrábica', category: 'vacina', price: 60.00, description: 'Vacina antirrábica', duration: 15 },
    { name: 'Banho e Tosa', category: 'banho_tosa', price: 75.00, description: 'Banho e tosa completa', duration: 60 },
    { name: 'Exame de Sangue', category: 'exame', price: 150.00, description: 'Hemograma completo', duration: 20 },
    { name: 'Ultrassom', category: 'exame', price: 200.00, description: 'Exame de imagem ultrassonográfico', duration: 30 },
    { name: 'Castração Macho', category: 'cirurgia', price: 350.00, description: 'Orquiectomia', duration: 45 },
    { name: 'Castração Fêmea', category: 'cirurgia', price: 450.00, description: 'Ovariohisterectomia', duration: 60 },
  ]

  for (const service of services) {
    const exists = await prisma.service.findFirst({
      where: { name: service.name },
    })
    if (!exists) {
      await prisma.service.create({ data: service })
    }
  }
  console.log(`✅ ${services.length} serviços criados`)

  // Criar configurações padrão
  const configs = [
    { key: 'ai_enabled', value: 'true', category: 'ai' },
    { key: 'ai_greeting', value: 'Olá! Seja bem-vindo(a) à nossa clínica veterinária. Como posso ajudar você e seu pet hoje?', category: 'ai' },
    { key: 'ai_fallback_message', value: 'Não encontrei essa informação em nossa base. Um recepcionista dará continuidade ao atendimento em breve.', category: 'ai' },
    { key: 'ai_emergency_message', value: 'Seu caso pode exigir atendimento veterinário imediato. Recomendamos procurar uma clínica ou hospital veterinário o mais rápido possível.', category: 'ai' },
    { key: 'ai_working_hours', value: '08:00-18:00', category: 'ai' },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      create: config,
      update: {},
    })
  }
  console.log('✅ Configurações padrão criadas')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
