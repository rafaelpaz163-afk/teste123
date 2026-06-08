import { Request, Response } from 'express';
import { backupService } from '../services/backupService';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';

export class BackupController {
  async list(req: Request, res: Response) {
    const backups = await backupService.listBackups();
    res.json(backups);
  }

  async create(req: Request, res: Response) {
    const result = await backupService.createBackup();
    res.status(201).json(result);
  }

  async restore(req: Request, res: Response) {
    const { id } = req.params;
    const result = await backupService.restoreBackup(id);
    res.json(result);
  }
}

export const backupController = new BackupController();
