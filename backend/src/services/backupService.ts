import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { prisma } from '../server';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export class BackupService {
  async createBackup() {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const fileName = `backup_${timestamp}.sql`;
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, fileName);

    // Criar diretório se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      // Extrair credenciais do DATABASE_URL
      const dbUrl = new URL(process.env.DATABASE_URL || '');
      const host = dbUrl.hostname;
      const port = dbUrl.port || '5432';
      const database = dbUrl.pathname.replace('/', '');
      const username = dbUrl.username;
      const password = dbUrl.password;

      // Executar pg_dump
      const env = { ...process.env, PGPASSWORD: password };
      await execAsync(
        `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${filePath}`,
        { env }
      );

      const stats = fs.statSync(filePath);

      // Salvar registro no banco
      await prisma.backup.create({
        data: {
          fileName,
          fileSize: stats.size,
          fileUrl: `/backups/${fileName}`,
          status: 'SUCCESS',
        },
      });

      // Limpar backups antigos
      await this.cleanOldBackups();

      logger.info(`✅ Backup criado: ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      return { fileName, filePath, size: stats.size };
    } catch (error) {
      await prisma.backup.create({
        data: {
          fileName,
          fileSize: 0,
          fileUrl: '',
          status: 'FAILED',
        },
      });

      logger.error('❌ Falha ao criar backup:', error);
      throw error;
    }
  }

  async restoreBackup(backupId: string) {
    const backup = await prisma.backup.findUnique({ where: { id: backupId } });
    if (!backup || backup.status !== 'SUCCESS') {
      throw new Error('Backup não encontrado ou com falha');
    }

    const filePath = path.join(process.cwd(), 'backups', backup.fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo de backup não encontrado');
    }

    try {
      const dbUrl = new URL(process.env.DATABASE_URL || '');
      const host = dbUrl.hostname;
      const port = dbUrl.port || '5432';
      const database = dbUrl.pathname.replace('/', '');
      const username = dbUrl.username;
      const password = dbUrl.password;

      const env = { ...process.env, PGPASSWORD: password };
      await execAsync(
        `psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${filePath}`,
        { env }
      );

      logger.info(`✅ Backup restaurado: ${backup.fileName}`);
      return { success: true };
    } catch (error) {
      logger.error('❌ Falha ao restaurar backup:', error);
      throw error;
    }
  }

  async cleanOldBackups() {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const oldBackups = await prisma.backup.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: 'SUCCESS',
      },
    });

    for (const backup of oldBackups) {
      const filePath = path.join(process.cwd(), 'backups', backup.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.backup.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    logger.info(`🧹 ${oldBackups.length} backups antigos removidos`);
  }

  async listBackups() {
    return prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const backupService = new BackupService();
