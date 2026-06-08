import { Request, Response } from 'express';
import { prisma } from '../server';

export class QualityScoreController {
  async create(req: Request, res: Response) {
    const { conversationId, score, responseQuality, responseTime, converted, notes } = req.body;

    const qualityScore = await prisma.qualityScore.create({
      data: {
        conversationId,
        score,
        responseQuality,
        responseTime,
        converted,
        notes,
      },
    });

    res.status(201).json(qualityScore);
  }

  async list(req: Request, res: Response) {
    const scores = await prisma.qualityScore.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          include: {
            tutor: { select: { name: true } },
          },
        },
      },
    });

    res.json(scores);
  }

  async getStats(req: Request, res: Response) {
    const stats = await prisma.qualityScore.aggregate({
      _avg: { score: true, responseQuality: true, responseTime: true },
      _count: { converted: true },
    });

    res.json(stats);
  }
}

export const qualityScoreController = new QualityScoreController();
