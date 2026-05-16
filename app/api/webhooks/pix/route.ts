import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { external_id, status } = body;

    // 1. Log de Auditoria Detalhado (Mantido SSOT)
    console.log(`[Webhook PIX] Recebido - ID: ${external_id}, Status: ${status}`);

    if (!external_id || !status) {
      return NextResponse.json({ error: 'Payload incompleto. external_id e status mandatórios.' }, { status: 400 });
    }

    // 2. Busca Ativa no Banco usando a coluna de índice do legado
    const existingTransaction = await prisma.transaction.findUnique({
      where: { externalId: external_id }
    });

    if (!existingTransaction) {
      console.error(`[Webhook PIX] ERRO: Transação ${external_id} não localizada no banco de dados.`);
      return NextResponse.json({ 
        error: 'Transaction not found', 
        detail: `ID ${external_id} does not exist in externalId column` 
      }, { status: 404 });
    }

    // 3. Verificação de Idempotência Estrita (Evita processamento duplicado)
    if (existingTransaction.status === 'SUCCESS' && status === 'PAID') {
      console.log(`[Webhook PIX] Transação ${external_id} já processada anteriormente. Idempotency Lock acionado.`);
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // 4. Atualização de Status Dinâmica e Resiliente (Tratamento para o Prisma 7)
    await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: { 
        status: status === 'PAID' ? 'SUCCESS' : 'FAILED',
        // Injeta metadados de auditoria preservando o log de alteração
        rawAcquirerResponse: JSON.stringify({
          ...JSON.parse(existingTransaction.rawAcquirerResponse || '{}'),
          webhookNotification: body,
          processedAt: new Date().toISOString()
        })
      }
    });

    console.log(`[Webhook PIX] ✅ Transação ${external_id} atualizada para ${status === 'PAID' ? 'SUCCESS' : 'FAILED'}.`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error(`[Webhook PIX] CRITICAL ERROR:`, error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}