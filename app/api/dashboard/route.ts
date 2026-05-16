import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Captura o merchantId enviado via cabeçalho HTTP (Garantia de Multi-tenancy)
    const merchantId = request.headers.get('x-merchant-id');

    if (!merchantId) {
      return NextResponse.json({ error: 'Unauthorized Merchant' }, { status: 401 });
    }

    // Agrupamento robusto de performance de faturamento por status da transação
    const aggregates = await prisma.transaction.groupBy({
      by: ['status'],
      where: {
        merchantId: merchantId,
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: aggregates,
    });
  } catch (error: any) {
    console.error('[Dashboard API Error]:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}