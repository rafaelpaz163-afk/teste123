import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';
import { appointmentSchema } from '../utils/validators';
import { logger } from '../utils/logger';
import { whatsappService } from '../services/whatsappService';

export class AppointmentController {
  async list(req: Request, res: Response) {
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          tutor: { select: { id: true, name: true, phone: true } },
          pet: { select: { id: true, name: true, species: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({ appointments, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  }

  async create(req: Request, res: Response) {
    const data = appointmentSchema.parse(req.body);

    const appointment = await prisma.appointment.create({
      data,
      include: { tutor: true, pet: true },
    });

    // Notificar grupo de recepcionistas
    const receptionGroup = process.env.RECEPTION_GROUP_ID;
    if (receptionGroup) {
      await whatsappService.sendGroupMessage(receptionGroup,
        `🚨 NOVO AGENDAMENTO PENDENTE\n\n📌 Dados do Tutor\nNome: ${appointment.tutor.name}\nCPF: ${appointment.tutor.cpf || 'Não informado'}\nTelefone: ${appointment.tutor.phone}\n\n🐾 Dados do Pet\nNome: ${appointment.pet?.name || 'Não informado'}\nEspécie: ${appointment.pet?.species || 'Não informado'}\n\n📅 Atendimento\nServiço: ${appointment.serviceType}\nMelhor Horário: ${appointment.preferredTime || 'Não informado'}\n\nStatus: AGUARDANDO CONTATO DA RECEPÇÃO\nData: ${new Date().toLocaleString('pt-BR')}`
      );
    }

    logger.info(`📅 Novo agendamento: ${appointment.tutor.name} - ${appointment.serviceType}`);

    res.status(201).json(appointment);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status, notes },
      include: { tutor: true, pet: true },
    });

    res.json(appointment);
  }

  async getStats(req: Request, res: Response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pending, confirmed, completed, cancelled, total] = await Promise.all([
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.appointment.count(),
    ]);

    res.json({ pending, confirmed, completed, cancelled, total });
  }
}

export const appointmentController = new AppointmentController();
