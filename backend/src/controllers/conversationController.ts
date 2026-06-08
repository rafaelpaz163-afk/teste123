import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { whatsappService } from '../services/whatsappService';
import { aiService } from '../services/aiService';

export class ConversationController {
  async list(req: Request, res: Response) {
    const { status, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { phoneNumber: { contains: search as string, mode: 'insensitive' } },
        { tutor: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          tutor: { select: { id: true, name: true, phone: true } },
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.conversation.count({ where }),
    ]);

    res.json({ conversations, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        tutor: { include: { pets: true } },
        assignedTo: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND');
    }

    // Marcar mensagens como lidas
    await prisma.message.updateMany({
      where: { conversationId: id, sender: 'CUSTOMER', isRead: false },
      data: { isRead: true },
    });

    res.json(conversation);
  }

  async sendMessage(req: Request, res: Response) {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { tutor: true },
    });

    if (!conversation) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND');
    }

    // Salvar mensagem do atendente
    await prisma.message.create({
      data: {
        conversationId: id,
        sender: 'HUMAN',
        content,
      },
    });

    // Enviar via WhatsApp
    await whatsappService.sendMessage(conversation.phoneNumber, content);

    // Atualizar conversa
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date(), status: 'HUMAN_HANDLING' },
    });

    res.json({ success: true });
  }

  async takeOver(req: Request, res: Response) {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        status: 'HUMAN_HANDLING',
        assignedToId: userId,
        isAiActive: false,
      },
      include: {
        tutor: { select: { name: true, phone: true } },
        assignedTo: { select: { name: true } },
      },
    });

    // Registrar no audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TAKE_OVER_CONVERSATION',
        description: `Assumiu atendimento: ${conversation.tutor?.name || conversation.phoneNumber}`,
      },
    });

    logger.info(`🤝 Atendimento assumido: ${conversation.id} por ${conversation.assignedTo?.name}`);

    res.json(conversation);
  }

  async returnToAI(req: Request, res: Response) {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        status: 'AI_HANDLING',
        assignedToId: null,
        isAiActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'RETURN_TO_AI',
        description: `Devolveu atendimento para IA: ${conversation.id}`,
      },
    });

    res.json(conversation);
  }

  async close(req: Request, res: Response) {
    const { id } = req.params;

    const conversation = await prisma.conversation.update({
      where: { id },
      data: { status: 'FINISHED', endedAt: new Date() },
    });

    res.json(conversation);
  }

  async getStats(req: Request, res: Response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCount, monthCount, totalCount, avgTime] = await Promise.all([
      prisma.conversation.count({ where: { startedAt: { gte: today } } }),
      prisma.conversation.count({ where: { startedAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } }),
      prisma.conversation.count(),
      prisma.conversation.aggregate({
        where: { endedAt: { not: null } },
        _avg: { startedAt: true }, // Simplificado
      }),
    ]);

    const byStatus = await prisma.conversation.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    res.json({
      today: todayCount,
      month: monthCount,
      total: totalCount,
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count.status])),
    });
  }
}

export const conversationController = new ConversationController();
