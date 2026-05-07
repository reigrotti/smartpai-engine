import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Acesso negado: Header de Autorização ausente.' }, { status: 401 });
    }

    const providedSecretKey = authHeader.split(' ')[1];

    const merchant = await prisma.merchant.findUnique({
      where: { secretKey: providedSecretKey }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Acesso negado: Secret Key inválida.' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      merchant: merchant.name,
      message: 'Autenticação bem-sucedida! Rota de pagamento liberada.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Erro na API Pay:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
