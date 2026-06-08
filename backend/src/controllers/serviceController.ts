import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';
import { serviceSchema } from '../utils/validators';

export class ServiceController {
  async list(req: Request, res: Response) {
    const { category, search, active } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (active !== undefined) where.isActive = active === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { category: 'asc' },
    });

    res.json(services);
  }

  async create(req: Request, res: Response) {
    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.create({ data });
    res.status(201).json(service);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = serviceSchema.partial().parse(req.body);
    const service = await prisma.service.update({ where: { id }, data });
    res.json(service);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  }
}

export const serviceController = new ServiceController();
