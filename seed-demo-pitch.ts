// 1. Injeção de Segurança e Governança de Infraestrutura
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:test123@127.0.0.1:5432/postgres";
}
process.env.PGUSER = "postgres";
process.env.PGPASSWORD = "test123";
process.env.PGHOST = "127.0.0.1";
process.env.PGPORT = "5432";
process.env.PGDATABASE = "postgres";

// 2. Importação estável da instância com Driver Adapter
import { prisma } from '@/lib/prisma';

async function main() {
  console.log('[Seed Pitch] Iniciando purga de dados antigos para consistência...');
  await prisma.transaction.deleteMany();
  await prisma.cardOnFile.deleteMany();
  await prisma.merchant.deleteMany();

  console.log('[Seed Pitch] Criando Merchant corporativo homologado...');
  const merchant = await prisma.merchant.create({
    data: {
      id: 'e1b6f528-98e3-4d2c-87db-949d2112480b',
      name: 'LOJA ALPHA RETAIL',
      publicKey: 'pk_live_alpha_retail_2026_key',
      secretKey: 'sk_live_alpha_retail_secure_token',
      status: 'ACTIVE'
    }
  });

  console.log(`[Seed Pitch] Merchant criado: ${merchant.name} (ID: ${merchant.id})`);
  console.log('[Seed Pitch] Injetando cenários financeiros para a Bossa Invest...');

  // Cenário 1: Sucesso Direto (Visa -> Cielo)
  await prisma.transaction.create({
    data: {
      pspReference: 'RIQ-VISA-OK88',
      merchantId: merchant.id,
      amount: 15000, 
      status: 'AUTHORIZED',
      acquirer: 'Cielo',
      recoveredByRoutIQ: false,
      bin: '411111',
      brand: 'Visa',
      // Serialização mandatória para casar com o tipo String do schema atual
      rawAcquirerResponse: JSON.stringify({ success: true, error: null, providerName: 'Cielo', isSoftDecline: false }),
      shopperData: JSON.stringify({ name: 'Reinaldo Grotti Sênior' }),
      riskData: JSON.stringify({ score: 12 })
    }
  });

  // Cenário 2: Silent Recovery (Valor Final 99 | Visa -> Falha Cielo -> Recuperado na Rede)
  await prisma.transaction.create({
    data: {
      pspReference: 'RIQ-FALLBACK-REC99',
      merchantId: merchant.id,
      amount: 25099, 
      status: 'AUTHORIZED',
      acquirer: 'Rede',
      recoveredByRoutIQ: true, // KPI Vital para o Gráfico de Vendas Recuperadas
      bin: '401200',
      brand: 'Visa',
      rawAcquirerResponse: JSON.stringify({ 
        success: true, 
        error: null, 
        providerName: 'Rede', 
        isSoftDecline: false,
        fallbackContext: 'Cielo retornou Soft Decline 99'
      }),
      shopperData: JSON.stringify({ name: 'Caroline Silva Verassani' }),
      riskData: JSON.stringify({ score: 5 })
    }
  });

  // Cenário 3: Hard Decline (Master -> Rede Rejeita Direct -> Fila Interrompida)
  await prisma.transaction.create({
    data: {
      pspReference: 'RIQ-HARD-DECLINE',
      merchantId: merchant.id,
      amount: 8750, 
      status: 'DECLINED',
      acquirer: 'Rede',
      recoveredByRoutIQ: false,
      bin: '510510',
      brand: 'Mastercard',
      rawAcquirerResponse: JSON.stringify({ 
        success: false, 
        error: 'Card Blocked / Fraud Risk', 
        providerName: 'Rede', 
        isSoftDecline: false 
      }),
      shopperData: JSON.stringify({ name: 'Comprador Suspeito' }),
      riskData: JSON.stringify({ score: 99 })
    }
  });

  console.log('[Seed Pitch] Massa de dados injetada com sucesso no Cloud SQL.');
}

main()
  .catch((e) => {
    console.error('[Seed Pitch] Erro crítico na execução:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });