import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authRouter } from './routes/auth';
import { conversationRouter } from './routes/conversations';
import { tutorRouter } from './routes/tutors';
import { petRouter } from './routes/pets';
import { appointmentRouter } from './routes/appointments';
import { knowledgeBaseRouter } from './routes/knowledgeBase';
import { serviceRouter } from './routes/services';
import { dashboardRouter } from './routes/dashboard';
import { aiConfigRouter } from './routes/aiConfig';
import { reportRouter } from './routes/reports';
import { auditLogRouter } from './routes/auditLogs';
import { backupRouter } from './routes/backups';
import { leadRouter } from './routes/leads';
import { webhookRouter } from './routes/webhooks';
import { whatsappRouter } from './routes/whatsapp';
import { emergencyRouter } from './routes/emergencies';
import { qualityScoreRouter } from './routes/qualityScores';

dotenv.config();

const app = express();

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/tutors', tutorRouter);
app.use('/api/pets', petRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/knowledge-base', knowledgeBaseRouter);
app.use('/api/services', serviceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai-config', aiConfigRouter);
app.use('/api/reports', reportRouter);
app.use('/api/audit-logs', auditLogRouter);
app.use('/api/backups', backupRouter);
app.use('/api/leads', leadRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/emergencies', emergencyRouter);
app.use('/api/quality-scores', qualityScoreRouter);

app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
