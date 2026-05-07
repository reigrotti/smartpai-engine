import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { PaymentService } from '../../../lib/services/paymentService';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Acesso negado: Header de Autorização ausente.' }, { status: 401 });
    }

    const providedSecretKey = authHeader.split(' ')[1];
    const body = await request.json();

    // 1. Validação do Merchant
    const merchant = await prisma.merchant.findUnique({
      where: { secretKey: providedSecretKey }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Acesso negado: Secret Key inválida.' }, { status: 401 });
    }

    // 2. Processamento do Pagamento (Cielo/Rede)
    const result = await PaymentService.process({
      merchantId: merchant.id,
      amount: body.amount,
      cardToken: body.cardToken
    });

    // 3. PERSISTÊNCIA NO BANCO (O elo perdido)
    // Aqui gravamos o externalId para que o Webhook consiga encontrar a transação depois
    await prisma.transaction.create({
      data: {
        merchantId: merchant.id,
        amount: body.amount,
        status: result.status === 'approved' ? 'SUCCESS' : 'FAILED',
        provider: result.provider,
        externalId: result.transactionId, // O ID que o Webhook usará (ex: cielo_123)
        // Adicione outros campos conforme seu schema (ex: cardLastFour se houver)
      }
    });

    console.log(`[API Pay] Transação gravada com sucesso: ${result.transactionId}`);

    return NextResponse.json({ 
      success: true, 
      merchant: merchant.name,
      ...result
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro na API Pay:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}