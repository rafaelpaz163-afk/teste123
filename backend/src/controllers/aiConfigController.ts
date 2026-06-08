import { Request, Response } from 'express';
import { prisma } from '../server';
import { whatsappService } from '../services/whatsappService';
import { logger } from '../utils/logger';

export class AIConfigController {
  async getStatus(req: Request, res: Response) {
    const aiEnabled = await prisma.systemConfig.findUnique({
      where: { key: 'ai_enabled' },
    });

    const greeting = await prisma.systemConfig.findUnique({
      where: { key: 'ai_greeting' },
    });

    const fallback = await prisma.systemConfig.findUnique({
      where: { key: 'ai_fallback_message' },
    });

    const emergency = await prisma.systemConfig.findUnique({
      where: { key: 'ai_emergency_message' },
    });

    const workingHours = await prisma.systemConfig.findUnique({
      where: { key: 'ai_working_hours' },
    });

    res.json({
      enabled: aiEnabled?.value !== 'false',
      greeting: greeting?.value || process.env.AI_GREETING,
      fallbackMessage: fallback?.value || process.env.AI_FALLBACK_MESSAGE,
      emergencyMessage: emergency?.value || process.env.EMERGENCY_MESSAGE,
      workingHours: workingHours?.value || '08:00-18:00',
    });
  }

  async updateStatus(req: Request, res: Response) {
    const { enabled, greeting, fallbackMessage, emergencyMessage, workingHours } = req.body;

    const configs = [
      { key: 'ai_enabled', value: enabled?.toString() },
      { key: 'ai_greeting', value: greeting },
      { key: 'ai_fallback_message', value: fallbackMessage },
      { key: 'ai_emergency_message', value: emergencyMessage },
      { key: 'ai_working_hours', value: workingHours },
    ];

    for (const config of configs) {
      if (config.value !== undefined) {
        await prisma.systemConfig.upsert({
          where: { key: config.key },
          create: { key: config.key, value: config.value, category: 'ai' },
          update: { value: config.value },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: (req as any).user?.id,
        action: 'UPDATE_AI_CONFIG',
        description: `Configuração de IA atualizada: enabled=${enabled}`,
      },
    });

    logger.info(`⚙️ Configuração de IA atualizada: enabled=${enabled}`);

    res.json({ success: true });
  }

  async toggleAI(req: Request, res: Response) {
    const { enabled } = req.body;

    await prisma.systemConfig.upsert({
      where: { key: 'ai_enabled' },
      create: { key: 'ai_enabled', value: enabled.toString(), category: 'ai' },
      update: { value: enabled.toString() },
    });

    await prisma.auditLog.create({
      data: {
        userId: (req as any).user?.id,
        action: enabled ? 'ENABLE_AI' : 'DISABLE_AI',
        description: `IA ${enabled ? 'ligada' : 'desligada'}`,
      },
    });

    logger.info(`🤖 IA ${enabled ? 'LIGADA' : 'DESLIGADA'}`);

    res.json({ enabled });
  }
}

export const aiConfigController = new AIConfigController();
