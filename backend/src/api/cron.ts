import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../server-vercel';
import { logger } from '../utils/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    logger.info('⏰ [CRON] Iniciando tarefas diárias...');
    const results: any = {};

    // 1. LIMPAR CONVERSAS INATIVAS (mais importante - roda primeiro)
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const { count: cleanedCount } = await prisma.conversation.updateMany({
        where: {
          status: { in: ['WAITING_CUSTOMER', 'AI_HANDLING'] },
          lastMessageAt: { lt: twoDaysAgo },
        },
        data: { status: 'FINISHED', endedAt: new Date() },
      });
      results.cleanup = { success: true, cleaned: cleanedCount };
      logger.info(`🧹 ${cleanedCount} conversas inativas limpas`);
    } catch (error) {
      results.cleanup = { success: false, error: (error as Error).message };
      logger.error('Erro no cleanup:', error);
    }

    // 2. VERIFICAR LEADS SEM RESPOSTA (após 48h)
    try {
      const noResponseHours = parseInt(process.env.NO_RESPONSE_HOURS || '48');
      const cutoffDate = new Date(Date.now() - noResponseHours * 60 * 60 * 1000);

      const noResponseLeads = await prisma.lead.findMany({
        where: {
          classification: 'INTERESTED',
          lastContact: { lt: cutoffDate },
        },
      });

      for (const lead of noResponseLeads) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            classification: 'NO_RESPONSE',
            followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }
      results.noResponse = { success: true, updated: noResponseLeads.length };
      logger.info(`📋 ${noResponseLeads.length} leads marcados como sem resposta`);
    } catch (error) {
      results.noResponse = { success: false, error: (error as Error).message };
      logger.error('Erro no-response:', error);
    }

    // 3. VERIFICAR LEADS PERDIDOS (follow-up expirado)
    try {
      const lostLeads = await prisma.lead.findMany({
        where: {
          classification: { in: ['NO_RESPONSE', 'INTERESTED'] },
          followUpDate: { lt: new Date() },
        },
      });

      for (const lead of lostLeads) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { classification: 'LOST' },
        });
      }
      results.lostLeads = { success: true, updated: lostLeads.length };
      logger.info(`💔 ${lostLeads.length} leads marcados como perdidos`);
    } catch (error) {
      results.lostLeads = { success: false, error: (error as Error).message };
      logger.error('Erro lost-leads:', error);
    }

    // 4. BACKUP SIMPLIFICADO (log + status no banco)
    try {
      await prisma.systemConfig.upsert({
        where: { key: 'last_backup' },
        create: { key: 'last_backup', value: new Date().toISOString(), category: 'system' },
        update: { value: new Date().toISOString() },
      });
      results.backup = { success: true, timestamp: new Date().toISOString() };
      logger.info('💾 Backup registrado');
    } catch (error) {
      results.backup = { success: false, error: (error as Error).message };
      logger.error('Erro backup:', error);
    }

    logger.info('✅ [CRON] Todas as tarefas concluídas');
    res.status(200).json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      results 
    });

  } catch (error) {
    logger.error('❌ [CRON] Erro geral:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}
