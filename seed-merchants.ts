import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// 1. Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

async function seed() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ Erro: DATABASE_URL não encontrada no seu arquivo .env");
    return;
  }

  // 2. Configura o Pool de conexão (Sem SSL para o túnel do Cloud SQL Proxy)
  const pool = new Pool({ 
    connectionString,
    max: 1 // Limita a 1 conexão para este script de seed
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("⏳ Conectando ao banco e injetando Merchant...");

    // 3. Insere ou Atualiza o Merchant de Teste (Upsert evita duplicidade)
    const merchant = await prisma.merchant.upsert({
      where: { id: "test-merchant-001" },
      update: {
        secretKey: "sk_live_routiq_001",
        status: "ACTIVE"
      },
      create: {
        id: "test-merchant-001",
        name: "Active Solutions Test",
        publicKey: "pk_live_routiq_001",
        secretKey: "sk_live_routiq_001",
        status: "ACTIVE"
      }
    });

    console.log("✅ Merchant de teste criado/validado:", merchant.name);
    console.log("🔑 Secret Key disponível: sk_live_routiq_001");

  } catch (e: any) {
    console.error("❌ Erro técnico no seed:", e.message);
  } finally {
    // 4. Ritual de limpeza para liberar o terminal
    await prisma.$disconnect();
    await pool.end();
  }
}

seed();