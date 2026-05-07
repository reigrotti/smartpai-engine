import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // 1. Métricas Consolidadas (Cards)
    const stats = await prisma.transaction.groupBy({
      by: ['provider', 'status'],
      _count: { id: true },
      _sum: { amount: true }
    });

    // 2. Dados de Série Temporal (Gráfico)
    // Usamos queryRaw para extrair a data formatada e agrupar
    const chartData = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'DD/MM') as date,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as failed
      FROM "Transaction"
      WHERE "createdAt" > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date
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

    return NextResponse.json({ stats, chartData, recent });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
