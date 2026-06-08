import { Request, Response } from 'express';
import { prisma } from '../server';

export class EmergencyController {
  async list(req: Request, res: Response) {
    const { isResolved, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [alerts, total] = await Promise.all([
      prisma.emergencyAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.emergencyAlert.count({ where }),
    ]);

    res.json({ alerts, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  }

  async resolve(req: Request, res: Response) {
    const { id } = req.params;

    const alert = await prisma.emergencyAlert.update({
      where: { id },
      data: { isResolved: true, resolvedAt: new Date() },
    });

    res.json(alert);
  }
}

export const emergencyController = new EmergencyController();
