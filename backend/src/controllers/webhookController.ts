import { Request, Response } from 'express';
import { prisma } from '../server';
import { whatsappService } from '../services/whatsappService';
import { logger } from '../utils/logger';

export class WebhookController {
  async handleEvolution(req: Request, res: Response) {
    const { event, data } = req.body;

    logger.info(`📥 Webhook recebido: ${event}`);

    if (event === 'messages.upsert') {
      const { message, key, pushName } = data;

      // Ignorar mensagens do próprio bot
      if (key.fromMe) {
        return res.status(200).json({ received: true });
      }

      const phoneNumber = key.remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
      const messageContent = message.conversation || message.extendedTextMessage?.text || '';

      // Processar mensagem
      await whatsappService.handleIncomingMessage(phoneNumber, messageContent, message.key.id);
    }

    res.status(200).json({ received: true });
  }

  async handleStatus(req: Request, res: Response) {
    const { event, data } = req.body;

    if (event === 'connection.update') {
      logger.info(`🔗 Status da conexão: ${data.state}`);
    }

    res.status(200).json({ received: true });
  }
}

export const webhookController = new WebhookController();
