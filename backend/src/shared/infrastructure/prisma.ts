import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const isUniqueConstraintViolation = (error: unknown) =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
