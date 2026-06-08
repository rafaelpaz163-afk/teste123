import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';
import { loginSchema, createUserSchema } from '../utils/validators';
import { logger } from '../utils/logger';

export class AuthController {
  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // Registrar login no audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        description: `Login realizado: ${user.email}`,
        ipAddress: req.ip,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`👤 Login: ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  async register(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError('Email já cadastrado', 409, 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    logger.info(`👤 Novo usuário: ${user.email}`);

    res.status(201).json(user);
  }

  async me(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    res.json(user);
  }

  async logout(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        description: 'Logout realizado',
        ipAddress: req.ip,
      },
    });

    res.json({ message: 'Logout realizado com sucesso' });
  }

  async listUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { name, role, isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    res.json(user);
  }
}

export const authController = new AuthController();
