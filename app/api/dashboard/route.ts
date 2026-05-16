import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Agregação por provedor mapeada para o contrato esperado pelo Front-end (stats)
    const rawStats = await prisma.transaction.groupBy({
      by: ['acquirer', 'status'],
      _count: { id: true },
      _sum: { amount: true }
    });

    // Mapeamento cosmético para garantir compatibilidade caso o front espere a propriedade adaptada
    const stats = rawStats.map(s => ({
      acquirer: s.acquirer || 'Unknown',
      provider: s.acquirer || 'Unknown', // Fallback de retrocompatibilidade
      status: s.status,
      _count: s._count,
      _sum: s._sum
    }));

    // 2. Dados de Série Temporal ajustados para ler os enums reais (AUTHORIZED, SUCCESS, DECLINED)
    const chartData = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("created_at", 'DD/MM') as date,
        SUM(CASE WHEN status IN ('AUTHORIZED', 'SUCCESS') THEN amount ELSE 0 END)::int as approved,
        SUM(CASE WHEN status = 'DECLINED' THEN amount ELSE 0 END)::int as failed
      FROM "transactions"
      WHERE "created_at" > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR("created_at", 'DD/MM')
      ORDER BY date ASC
    `;

    // 3. Feed de Transações Recentes
    const recent = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { 
        merchant: { 
          select: { name: true } 
        } 
      }
    });

    // Altere o retorno para casar o nome com o esperado pelo front-end
    return NextResponse.json({ stats, chartData, recentTransactions: recent });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}