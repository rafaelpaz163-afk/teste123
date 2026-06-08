import cron from 'node-cron';
import { prisma, redis } from '../server';
import { logger } from './logger';
import { backupService } from '../services/backupService';
import { leadService } from '../services/leadService';
import { aiService } from '../services/aiService';

export function setupCronJobs() {
  // Backup automático diário (configurável)
  const backupTime = process.env.BACKUP_TIME || '02:00';
  const [hour, minute] = backupTime.split(':');

  cron.schedule(`${minute} ${hour} * * *`, async () => {
    logger.info('⏰ Running daily backup...');
    try {
      await backupService.createBackup();
      logger.info('✅ Daily backup completed');
    } catch (error) {
      logger.error('❌ Daily backup failed:', error);
    }
  });

  // Verificar clientes sem resposta (a cada 6 horas)
  cron.schedule('0 */6 * * *', async () => {
    logger.info('⏰ Checking no-response clients...');
    try {
      await leadService.checkNoResponseClients();
    } catch (error) {
      logger.error('❌ No-response check failed:', error);
    }
  });

  // Verificar leads perdidos (diariamente às 09:00)
  cron.schedule('0 9 * * *', async () => {
    logger.info('⏰ Checking lost leads...');
    try {
      await leadService.checkLostLeads();
    } catch (error) {
      logger.error('❌ Lost leads check failed:', error);
    }
  });

  // Limpar conversas inativas (a cada 2 horas)
  cron.schedule('0 */2 * * *', async () => {
    logger.info('⏰ Cleaning inactive conversations...');
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      await prisma.conversation.updateMany({
        where: {
          status: { in: ['WAITING_CUSTOMER', 'AI_HANDLING'] },
          lastMessageAt: { lt: twoDaysAgo },
        },
        data: { status: 'FINISHED', endedAt: new Date() },
      });
    } catch (error) {
      logger.error('❌ Conversation cleanup failed:', error);
    }
  });

  logger.info('✅ All cron jobs scheduled');
}
