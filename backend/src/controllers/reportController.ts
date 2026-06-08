import { Request, Response } from 'express';
import { prisma } from '../server';

export class ReportController {
  async conversations(req: Request, res: Response) {
    const { startDate, endDate, format = 'json' } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.startedAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        tutor: { select: { name: true, phone: true } },
        messages: { select: { sender: true, content: true, createdAt: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (format === 'csv') {
      const csv = this.convertToCSV(conversations);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=conversations.csv');
      return res.send(csv);
    }

    res.json(conversations);
  }

  async appointments(req: Request, res: Response) {
    const { startDate, endDate, status } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        tutor: { select: { name: true, phone: true } },
        pet: { select: { name: true, species: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(appointments);
  }

  async performance(req: Request, res: Response) {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [totalConversations, aiHandled, humanHandled, avgMessages] = await Promise.all([
      prisma.conversation.count({ where }),
      prisma.conversation.count({ where: { ...where, status: 'AI_HANDLING' } }),
      prisma.conversation.count({ where: { ...where, status: 'HUMAN_HANDLING' } }),
      prisma.message.groupBy({
        by: ['conversationId'],
        _count: { conversationId: true },
      }),
    ]);

    const qualityScores = await prisma.qualityScore.findMany({
      where: { createdAt: where.createdAt },
    });

    res.json({
      totalConversations,
      aiHandled,
      humanHandled,
      avgMessagesPerConversation: avgMessages.length > 0 
        ? avgMessages.reduce((a, b) => a + b._count.conversationId, 0) / avgMessages.length 
        : 0,
      qualityScores: {
        avg: qualityScores.length > 0 
          ? qualityScores.reduce((a, b) => a + b.score, 0) / qualityScores.length 
          : 0,
        total: qualityScores.length,
      },
    });
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }
}

export const reportController = new ReportController();
