import { Request, Response } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';
import { knowledgeBaseSchema } from '../utils/validators';
import { logger } from '../utils/logger';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';

export class KnowledgeBaseController {
  async list(req: Request, res: Response) {
    const { search, isManual, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (isManual !== undefined) where.isManual = isManual === 'true';

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [items, total] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where,
        orderBy: { priority: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.knowledgeBase.count({ where }),
    ]);

    res.json({ items, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  }

  async create(req: Request, res: Response) {
    const data = knowledgeBaseSchema.parse(req.body);

    const item = await prisma.knowledgeBase.create({ data });

    await prisma.auditLog.create({
      data: {
        userId: (req as any).user?.id,
        action: 'CREATE_KNOWLEDGE',
        description: `Criou conhecimento: ${item.title}`,
      },
    });

    res.status(201).json(item);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = knowledgeBaseSchema.partial().parse(req.body);

    const item = await prisma.knowledgeBase.update({ where: { id }, data });
    res.json(item);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.knowledgeBase.delete({ where: { id } });
    res.json({ success: true });
  }

  async uploadFile(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError('Nenhum arquivo enviado', 400, 'NO_FILE');
    }

    const { originalname, mimetype, path: filePath } = req.file;
    let content = '';

    try {
      if (mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        content = pdfData.text;
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        content = result.value;
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 mimetype === 'application/vnd.ms-excel') {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        content = xlsx.utils.sheet_to_csv(sheet);
      } else if (mimetype === 'text/csv') {
        content = fs.readFileSync(filePath, 'utf-8');
      } else if (mimetype === 'text/plain') {
        content = fs.readFileSync(filePath, 'utf-8');
      } else {
        throw new AppError('Formato não suportado', 400, 'UNSUPPORTED_FORMAT');
      }

      const item = await prisma.knowledgeBase.create({
        data: {
          title: originalname,
          content,
          fileName: originalname,
          fileType: mimetype,
          isManual: false,
        },
      });

      // Limpar arquivo temporário
      fs.unlinkSync(filePath);

      await prisma.auditLog.create({
        data: {
          userId: (req as any).user?.id,
          action: 'UPLOAD_FILE',
          description: `Upload de arquivo: ${originalname}`,
        },
      });

      logger.info(`📄 Arquivo processado: ${originalname} (${content.length} chars)`);

      res.status(201).json(item);
    } catch (error) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw error;
    }
  }
}

export const knowledgeBaseController = new KnowledgeBaseController();
