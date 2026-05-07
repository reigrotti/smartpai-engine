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

    // Busca o Merchant pela Secret Key (agora que o campo é @unique)
    const merchant = await prisma.merchant.findUnique({
      where: { secretKey: providedSecretKey }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Acesso negado: Secret Key inválida.' }, { status: 401 });
    }

    // Chama o serviço de pagamento
    const result = await PaymentService.process({
      merchantId: merchant.id,
      amount: body.amount,
      cardToken: body.cardToken
    });

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
