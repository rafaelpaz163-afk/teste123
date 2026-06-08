import { prisma } from '../server';
import { logger } from '../utils/logger';
import { whatsappService } from './whatsappService';

export class LeadService {
  async checkNoResponseClients() {
    const noResponseHours = parseInt(process.env.NO_RESPONSE_HOURS || '48');
    const cutoffDate = new Date(Date.now() - noResponseHours * 60 * 60 * 1000);

    const noResponseLeads = await prisma.lead.findMany({
      where: {
        classification: 'INTERESTED',
        lastContact: { lt: cutoffDate },
      },
      include: { tutor: true },
    });

    for (const lead of noResponseLeads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          classification: 'NO_RESPONSE',
          followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h para follow-up
        },
      });

      logger.info(`📋 Lead sem resposta: ${lead.tutor.name} (${lead.tutor.phone})`);
    }

    return noResponseLeads.length;
  }

  async checkLostLeads() {
    const lostLeads = await prisma.lead.findMany({
      where: {
        classification: { in: ['NO_RESPONSE', 'INTERESTED'] },
        followUpDate: { lt: new Date() },
      },
      include: { tutor: true },
    });

    for (const lead of lostLeads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { classification: 'LOST' },
      });

      logger.info(`💔 Lead perdido: ${lead.tutor.name} (${lead.tutor.phone})`);
    }

    return lostLeads.length;
  }

  async getLeadsByClassification(classification?: string) {
    const where = classification ? { classification: classification as any } : {};

    return prisma.lead.findMany({
      where,
      include: { tutor: { include: { pets: true } } },
      orderBy: { lastContact: 'desc' },
    });
  }

  async exportLeads(classification?: string) {
    const leads = await this.getLeadsByClassification(classification);

    // Retornar em formato CSV-friendly
    return leads.map(lead => ({
      id: lead.id,
      tutorName: lead.tutor.name,
      phone: lead.tutor.phone,
      email: lead.tutor.email,
      classification: lead.classification,
      lastContact: lead.lastContact,
      followUpDate: lead.followUpDate,
      pets: lead.tutor.pets.map(p => p.name).join(', '),
      source: lead.source,
    }));
  }

  async recoverLead(leadId: string) {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        classification: 'RECOVERED',
        lastContact: new Date(),
      },
    });

    logger.info(`♻️ Lead recuperado: ${leadId}`);
    return lead;
  }
}

export const leadService = new LeadService();
