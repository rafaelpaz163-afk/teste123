import { Request, Response } from 'express';
import { prisma } from '../server';

export class DashboardController {
  async getStats(req: Request, res: Response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      conversationsToday,
      conversationsMonth,
      totalClients,
      appointmentsPending,
      appointmentsConfirmed,
      emergenciesToday,
      avgResponseTime,
      leadsInterested,
      leadsReady,
      leadsLost,
    ] = await Promise.all([
      prisma.conversation.count({ where: { startedAt: { gte: today } } }),
      prisma.conversation.count({ where: { startedAt: { gte: monthStart } } }),
      prisma.tutor.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.emergencyAlert.count({ where: { createdAt: { gte: today } } }),
      prisma.conversation.aggregate({
        where: { endedAt: { not: null } },
        _avg: { startedAt: true },
      }),
      prisma.lead.count({ where: { classification: 'INTERESTED' } }),
      prisma.lead.count({ where: { classification: 'READY_TO_SCHEDULE' } }),
      prisma.lead.count({ where: { classification: 'LOST' } }),
    ]);

    // Serviços mais procurados
    const topServices = await prisma.appointment.groupBy({
      by: ['serviceType'],
      _count: { serviceType: true },
      orderBy: { _count: { serviceType: 'desc' } },
      take: 5,
    });

    // Horários de maior movimento (simplificado)
    const peakHours = await prisma.$queryRaw`
      SELECT EXTRACT(HOUR FROM "createdAt") as hour, COUNT(*) as count
      FROM "appointments"
      WHERE "createdAt" >= ${monthStart}
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY count DESC
      LIMIT 5
    `;

    res.json({
      conversations: { today: conversationsToday, month: conversationsMonth },
      clients: totalClients,
      appointments: { pending: appointmentsPending, confirmed: appointmentsConfirmed },
      emergencies: emergenciesToday,
      avgResponseTime: avgResponseTime._avg.startedAt,
      leads: { interested: leadsInterested, ready: leadsReady, lost: leadsLost },
      topServices: topServices.map(s => ({ name: s.serviceType, count: s._count.serviceType })),
      peakHours,
    });
  }
}

export const dashboardController = new DashboardController();
