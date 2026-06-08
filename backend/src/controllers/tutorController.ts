import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';
import { tutorSchema } from '../utils/validators';

export class TutorController {
  async list(req: Request, res: Response) {
    const { search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
        { cpf: { contains: search as string } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tutors, total] = await Promise.all([
      prisma.tutor.findMany({
        where,
        include: { pets: true, _count: { select: { appointments: true, conversations: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.tutor.count({ where }),
    ]);

    res.json({ tutors, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const tutor = await prisma.tutor.findUnique({
      where: { id },
      include: { pets: true, appointments: { include: { pet: true }, orderBy: { createdAt: 'desc' } } },
    });

    if (!tutor) throw new AppError('Tutor não encontrado', 404, 'NOT_FOUND');
    res.json(tutor);
  }

  async create(req: Request, res: Response) {
    const data = tutorSchema.parse(req.body);

    const tutor = await prisma.tutor.create({
      data,
      include: { pets: true },
    });

    res.status(201).json(tutor);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = tutorSchema.partial().parse(req.body);

    const tutor = await prisma.tutor.update({
      where: { id },
      data,
      include: { pets: true },
    });

    res.json(tutor);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.tutor.delete({ where: { id } });
    res.json({ success: true });
  }
}

export const tutorController = new TutorController();
