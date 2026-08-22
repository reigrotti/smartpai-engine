import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizeAcquirerError(errorStr: string | null, status: string): string {
  if (status === 'AUTHORIZED' || status === 'SUCCESS') return 'Aprovado';
  const cleanError = errorStr ? errorStr.toLowerCase() : '';
  if (cleanError.includes('fraud') || cleanError.includes('block') || cleanError.includes('suspect')) {
    return 'Suspeita de Fraude / Bloqueio';
  }
  if (cleanError.includes('decimals') || cleanError.includes('soft') || cleanError.includes('fund') || cleanError.includes('insufficient')) {
    return 'Margem Insuficiente (Refazer)';
  }
  if (cleanError.includes('generic') || cleanError === '' || errorStr === null) {
    return 'Falha na Comunicação / Timeout';
  }
  return errorStr || 'Recusada pela Adquirente';
}

export async function GET(request: NextRequest) {
  try {
    // Captura o parâmetro enviado pelo seletor do front-end
    const { searchParams } = new URL(request.url);
    const merchantParam = searchParams.get('merchant') || 'ACTIVE_SOLUTIONS';
    const isDemo = merchantParam === 'DEMO_STORE';

    // 1. Agrupamento via SQL Puro
    const statsRaw: any[] = await prisma.$queryRaw`
      SELECT 
        acquirer,
        status,
        recovered_by_routiq as "recoveredByRoutIQ",
        COUNT(id)::int as count_id,
        SUM(amount)::int as sum_amount
      FROM "transactions"
      GROUP BY acquirer, status, recovered_by_routiq
    `;

    // Se for Demo, aplica os multiplicadores direto no barramento de dados da API
    const stats = statsRaw.map(s => {
      let finalAmount = s.sum_amount;
      if (isDemo) {
        if (s.status === 'AUTHORIZED' || s.status === 'SUCCESS') finalAmount = s.sum_amount * 3.2;
        if (s.status === 'DECLINED') finalAmount = s.sum_amount * 0.25;
      }
      return {
        acquirer: s.acquirer,
        provider: s.acquirer, 
        status: s.status,
        recoveredByRoutIQ: s.recoveredByRoutIQ,
        _count: { id: s.count_id },
        _sum: { amount: finalAmount }
      };
    });

    // 2. Série Temporal para o Gráfico
    const chartDataRaw: any[] = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("created_at", 'DD/MM') as date,
        acquirer,
        SUM(CASE WHEN status IN ('AUTHORIZED', 'SUCCESS') THEN amount ELSE 0 END)::int as approved,
        SUM(CASE WHEN status = 'DECLINED' THEN amount ELSE 0 END)::int as failed
      FROM "transactions"
      WHERE "created_at" > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR("created_at", 'DD/MM'), acquirer
      ORDER BY date ASC
    `;

    const chartData = chartDataRaw.map(c => ({
      ...c,
      approved: isDemo ? c.approved * 3.2 : c.approved,
      failed: isDemo ? c.failed * 0.25 : c.failed
    }));

    // 3. Transações Recentes
    const recentRaw = await prisma.transaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { merchant: { select: { name: true } } }
    });

    const recentTransactions = recentRaw.map((tx: any) => {
      const rawResponse = tx.rawAcquirerResponse as Record<string, any> | null;
      const originalError = rawResponse?.error || null;
      return {
        ...tx,
        normalizedError: normalizeAcquirerError(originalError, tx.status),
        rawAcquirerResponse: {
          ...rawResponse,
          friendlyMessage: normalizeAcquirerError(originalError, tx.status)
        }
      };
    });

    return NextResponse.json({ stats, chartData, recentTransactions });

  } catch (error: any) {
    console.error("Critical Analytics Engine Failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}