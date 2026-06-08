import { Request, Response } from 'express';
import { prisma } from '../server';

export class AuditLogController {
  async list(req: Request, res: Response) {
    const { userId, action, page = '1', limit = '50' } = req.query;

    const where: any = {};
    if (userId) where.userId = userId as string;
    if (action) where.action = action as string;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ logs, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  }
}

export const auditLogController = new AuditLogController();
