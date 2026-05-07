import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { external_id, status } = body;

    // 1. Log de Auditoria Detalhado
    console.log(`[Webhook PIX] Recebido - ID: ${external_id}, Status: ${status}`);

    // 2. Busca Ativa no Banco
    const existingTransaction = await prisma.transaction.findUnique({
      where: { externalId: external_id }
    });

    if (!existingTransaction) {
      // Se cair aqui, o ID enviado no CURL não existe na coluna externalId do banco
      console.error(`[Webhook PIX] ERRO: Transação ${external_id} não localizada no banco de dados.`);
      return NextResponse.json({ 
        error: 'Transaction not found', 
        detail: `ID ${external_id} does not exist in externalId column` 
      }, { status: 404 });
    }

    // 3. Verificação de Idempotência
    if (existingTransaction.status === 'SUCCESS' && status === 'PAID') {
      console.log(`[Webhook PIX] Transação ${external_id} já processada anteriormente.`);
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // 4. Atualização de Status
    await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: { 
        status: status === 'PAID' ? 'SUCCESS' : 'FAILED',
        updatedAt: new Date()
      }
    });

    console.log(`[Webhook PIX] ✅ Transação ${external_id} atualizada para SUCCESS.`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error(`[Webhook PIX] CRITICAL ERROR:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}