import { processPayment } from '../../lib/services/paymentService';
import { prisma } from '../../lib/prisma';

async function runDiagnostic() {
  console.log('🚀 Iniciando Diagnóstico de Roteamento RoutIQ...');

  // 1. Setup: Garantir que existe um Merchant com chaves no banco
  const merchant = await prisma.merchant.upsert({
    where: { publicKey: 'pk_test_cielo' },
    update: {},
    create: {
      name: 'Loja Diagnóstico',
      publicKey: 'pk_test_cielo', // Use suas chaves reais de Sandbox aqui se quiser bater na API
      secretKey: 'sk_test_routiq_123',
    }
  });

  console.log(`✅ Merchant configurado: ${merchant.name}`);

  // 2. Simulação de Transação (Cenário de Fallback)
  // Vamos enviar um valor ou payload que sabemos que pode falhar na Cielo
  const payload = {
    secretKey: 'sk_test_routiq_123',
    amount: 50000, // R$ 500,00
    cardNumber: '0000000000000001', // Cartão de teste
    customerName: 'Reinaldo Diagnostic',
    brand: 'Visa'
  };

  try {
    console.log('📡 Disparando Orquestrador...');
    const result = await processPayment(payload);

    console.log('-------------------------------------------');
    console.log(`🏁 RESULTADO DO TESTE:`);
    console.log(`🔹 Adquirente Final: ${result.acquirer}`);
    console.log(`🔹 PSP Reference: ${result.pspReference}`);
    console.log(`🔹 Recuperado pela RoutIQ? ${result.recoveredByRoutIQ ? 'SIM (Fallback OK)' : 'NÃO (Fluxo Direto)'}`);
    console.log('-------------------------------------------');

  } catch (error: any) {
    console.error('❌ Falha Crítica no Teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runDiagnostic();