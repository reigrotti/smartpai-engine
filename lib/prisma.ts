import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Configuração do Pool SEM await
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

interface CustomNodeJsGlobal {
  prisma: PrismaClient | undefined;
}

declare const global: CustomNodeJsGlobal;

export const prisma = 
  global.prisma || 
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}