import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsappService';

export class WhatsAppController {
  async getStatus(req: Request, res: Response) {
    const status = await whatsappService.getConnectionStatus();
    res.json(status);
  }

  async sendMessage(req: Request, res: Response) {
    const { phoneNumber, message } = req.body;
    const result = await whatsappService.sendMessage(phoneNumber, message);
    res.json(result);
  }

  async sendGroupMessage(req: Request, res: Response) {
    const { groupId, message } = req.body;
    const result = await whatsappService.sendGroupMessage(groupId, message);
    res.json(result);
  }
}

export const whatsappController = new WhatsAppController();
