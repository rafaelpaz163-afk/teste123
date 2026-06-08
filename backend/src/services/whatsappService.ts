import axios from 'axios';
import { prisma } from '../server-vercel';
import { logger } from '../utils/logger';
import { aiService } from './aiService-vercel';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'vetclinic';

export class WhatsAppService {
  async sendMessage(phoneNumber: string, message: string, options?: { delay?: number }) {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const response = await axios.post(
        `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        { number: formattedNumber, text: message, delay: options?.delay || 1000 },
        { headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY } }
      );
      logger.info(`✅ Mensagem enviada para ${formattedNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Erro ao enviar mensagem:`, error);
      throw error;
    }
  }

  async sendGroupMessage(groupId: string, message: string) {
    try {
      const response = await axios.post(
        `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        { number: groupId, text: message, delay: 1000 },
        { headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY } }
      );
      logger.info(`✅ Mensagem enviada para grupo ${groupId}`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Erro ao enviar mensagem para grupo:`, error);
      throw error;
    }
  }

  async handleIncomingMessage(phoneNumber: string, message: string, messageId: string) {
    try {
      const aiEnabled = await this.isAIEnabled();
      if (!aiEnabled) {
        logger.info('🤖 IA desligada. Encaminhando para equipe.');
        return;
      }

      let conversation = await prisma.conversation.findFirst({
        where: { phoneNumber, status: { not: 'FINISHED' } },
        orderBy: { startedAt: 'desc' },
      });

      if (!conversation) {
        const tutor = await prisma.tutor.findUnique({ where: { phone: phoneNumber } });
        conversation = await prisma.conversation.create({
          data: { phoneNumber, tutorId: tutor?.id, status: 'AI_HANDLING' },
        });

        const greeting = await aiService.getGreeting();
        await this.sendMessage(phoneNumber, greeting, { delay: 2000 });
        await prisma.message.create({
          data: { conversationId: conversation.id, sender: 'AI', content: greeting },
        });
      }

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      await prisma.message.create({
        data: { conversationId: conversation.id, sender: 'CUSTOMER', content: message },
      });

      const aiResponse = await aiService.processMessage(phoneNumber, message, conversation.id);

      await prisma.message.create({
        data: { conversationId: conversation.id, sender: 'AI', content: aiResponse.response },
      });

      await this.sendMessage(phoneNumber, aiResponse.response, { delay: 1500 });

      if (aiResponse.type === 'emergency') {
        const emergencyGroup = process.env.EMERGENCY_GROUP_ID;
        if (emergencyGroup) {
          await this.sendGroupMessage(emergencyGroup, 
            `🚨 ALERTA DE EMERGÊNCIA

Cliente: ${phoneNumber}
Mensagem: ${message}
Conversa: ${conversation.id}`
          );
        }
      }

      if (aiResponse.intent === 'AGENDAMENTO' || aiResponse.intent === 'CONSULTA') {
        const receptionGroup = process.env.RECEPTION_GROUP_ID;
        if (receptionGroup) {
          await this.sendGroupMessage(receptionGroup,
            `📅 NOVO INTERESSADO

Cliente: ${phoneNumber}
Intenção: ${aiResponse.intent}
Conversa: ${conversation.id}`
          );
        }
      }

      return aiResponse;
    } catch (error) {
      logger.error('❌ Erro ao processar mensagem:', error);
      throw error;
    }
  }

  async isAIEnabled(): Promise<boolean> {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'ai_enabled' } });
    return config?.value !== 'false';
  }

  async getConnectionStatus() {
    try {
      const response = await axios.get(
        `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
        { headers: { 'apikey': EVOLUTION_API_KEY } }
      );
      return response.data;
    } catch (error) {
      logger.error('❌ Erro ao verificar status:', error);
      return { state: 'DISCONNECTED' };
    }
  }

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('9')) cleaned = '55' + cleaned;
    else if (cleaned.length === 10) cleaned = '55' + cleaned;
    return cleaned;
  }
}

export const whatsappService = new WhatsAppService();
