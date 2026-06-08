import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';
import { petSchema } from '../utils/validators';

export class PetController {
  async list(req: Request, res: Response) {
    const { tutorId, search } = req.query;

    const where: any = {};
    if (tutorId) where.tutorId = tutorId as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { species: { contains: search as string, mode: 'insensitive' } },
        { breed: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const pets = await prisma.pet.findMany({
      where,
      include: { tutor: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(pets);
  }

  async create(req: Request, res: Response) {
    const data = petSchema.parse(req.body);

    const pet = await prisma.pet.create({
      data,
      include: { tutor: true },
    });

    res.status(201).json(pet);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = petSchema.partial().parse(req.body);

    const pet = await prisma.pet.update({
      where: { id },
      data,
      include: { tutor: true },
    });

    res.json(pet);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.pet.delete({ where: { id } });
    res.json({ success: true });
  }
}

export const petController = new PetController();
