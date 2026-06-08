import OpenAI from 'openai';
import { prisma } from '../server-vercel';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMERGENCY_KEYWORDS = [
  'não está respirando', 'atropelado', 'atropelamento',
  'convulsão', 'convulsionando', 'sangramento intenso',
  'envenenamento', 'envenenado', 'não consegue levantar',
  'emergência', 'urgente', 'urgência', 'desmaiou',
  'inconsciente', 'não consegue andar', 'dificuldade para respirar',
  'engasgado', 'parada cardíaca', 'hemorragia', 'fratura',
  'trauma', 'choque', 'desidratação severa', 'bloat',
  'torção de estômago', 'parto complicações', 'aborto',
  'seizure', 'not breathing', 'bleeding', 'emergency',
  'unconscious', 'hit by car', 'poisoned', 'can't stand',
  'difficulty breathing', 'collapsed', 'severe'
];

export class AIService {
  async processMessage(phoneNumber: string, message: string, conversationId: string) {
    try {
      const isEmergency = this.checkEmergency(message);
      if (isEmergency) {
        await this.handleEmergency(phoneNumber, message, conversationId);
        return {
          type: 'emergency',
          response: process.env.EMERGENCY_MESSAGE || 
            'Seu caso pode exigir atendimento veterinário imediato. Recomendamos procurar uma clínica ou hospital veterinário o mais rápido possível.',
        };
      }

      const knowledge = await this.searchKnowledgeBase(message);
      const services = await this.searchServices(message);
      const tutor = await prisma.tutor.findUnique({
        where: { phone: phoneNumber },
        include: { pets: true },
      });

      const response = await this.generateResponse(message, knowledge, services, tutor);
      const intent = await this.detectIntent(message);
      await this.updateLeadClassification(phoneNumber, intent);

      return {
        type: 'normal',
        response,
        intent,
        knowledgeUsed: knowledge.length > 0,
      };
    } catch (error) {
      logger.error('AI processing error:', error);
      return {
        type: 'error',
        response: process.env.AI_FALLBACK_MESSAGE || 
          'Não encontrei essa informação em nossa base. Um recepcionista dará continuidade ao atendimento em breve.',
      };
    }
  }

  private checkEmergency(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  private async handleEmergency(phoneNumber: string, message: string, conversationId: string) {
    await prisma.emergencyAlert.create({
      data: {
        conversationId,
        triggerWord: EMERGENCY_KEYWORDS.find(k => message.toLowerCase().includes(k.toLowerCase())) || 'emergency',
        messageContent: message,
      },
    });
    logger.warn(`🚨 EMERGÊNCIA: ${phoneNumber} - ${message}`);
  }

  private async searchKnowledgeBase(query: string) {
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    return prisma.knowledgeBase.findMany({
      where: {
        OR: keywords.map(k => ({ content: { contains: k, mode: 'insensitive' } })),
      },
      orderBy: { priority: 'desc' },
      take: 5,
    });
  }

  private async searchServices(query: string) {
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    return prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          ...keywords.map(k => ({ name: { contains: k, mode: 'insensitive' } })),
          ...keywords.map(k => ({ category: { contains: k, mode: 'insensitive' } })),
        ],
      },
      take: 5,
    });
  }

  private async generateResponse(message: string, knowledge: any[], services: any[], tutor: any): Promise<string> {
    const systemPrompt = `Você é um atendente virtual de uma clínica veterinária. 
Seja educada, humanizada, objetiva, profissional e empática.
NUNCA faça diagnósticos, prescrições ou indicações médicas.
Sempre utilize a base de conhecimento fornecida.
Se não souber algo, informe que um recepcionista dará continuidade.

REGRAS:
- Não invente preços, use apenas os valores da tabela
- Não invente serviços que não existem
- Não garanta horários de agendamento
- Seja clara e rápida
- Use linguagem simples e acessível
- Sempre que possível, convide para agendamento

${tutor ? `Tutor: ${tutor.name}. Pets: ${tutor.pets.map((p: any) => p.name).join(', ')}` : 'Novo cliente'}`;

    const knowledgeContext = knowledge.length > 0 
      ? `BASE DE CONHECIMENTO:
${knowledge.map(k => `- ${k.title}: ${k.content}`).join('
')}`
      : 'Nenhuma informação na base de conhecimento.';

    const servicesContext = services.length > 0
      ? `TABELA DE SERVIÇOS:
${services.map(s => `- ${s.name} (${s.category}): R$ ${s.price}`).join('
')}`
      : 'Nenhum serviço encontrado.';

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: knowledgeContext },
        { role: 'system', content: servicesContext },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
  }

  private async detectIntent(message: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Classifique a intenção: CONSULTA, VACINA, BANHO_TOSA, CIRURGIA, EXAME, ORCAMENTO, INFORMACAO, EMERGENCIA, AGENDAMENTO, OUTRO. Responda APENAS a categoria.`,
      }, { role: 'user', content: message }],
      temperature: 0.1,
      max_tokens: 20,
    });
    return completion.choices[0]?.message?.content?.trim() || 'OUTRO';
  }

  private async updateLeadClassification(phoneNumber: string, intent: string) {
    const tutor = await prisma.tutor.findUnique({ where: { phone: phoneNumber } });
    if (!tutor) return;

    let classification: 'INTERESTED' | 'READY_TO_SCHEDULE' | 'NO_RESPONSE' | 'LOST' = 'INTERESTED';
    if (['CONSULTA', 'AGENDAMENTO', 'ORCAMENTO'].includes(intent)) {
      classification = 'READY_TO_SCHEDULE';
    }

    await prisma.lead.upsert({
      where: { id: tutor.id },
      create: { tutorId: tutor.id, classification, source: 'whatsapp_conversation' },
      update: { classification, lastContact: new Date() },
    });
  }

  async getGreeting(): Promise<string> {
    return process.env.AI_GREETING || 'Olá! Seja bem-vindo(a) à nossa clínica veterinária. Como posso ajudar você e seu pet hoje?';
  }
}

export const aiService = new AIService();
