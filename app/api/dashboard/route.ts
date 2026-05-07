import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Forçar a verificação do objeto importado
    const db = prisma;

    if (!db || !db.transaction) {
      console.error("DEBUG: Prisma Client não está disponível no runtime.");
      return NextResponse.json({ error: "Banco de dados indisponível no momento" }, { status: 500 });
    }

    const stats = await db.transaction.groupBy({
      by: ['provider', 'status'],
      _count: { id: true },
      _sum: { amount: true }
    });

    const recentTransactions = await db.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { merchant: { select: { name: true } } }
    });

    return NextResponse.json({
      title: "SmartPai Real-Time Health",
      status: "Operational",
      metrics: stats,
      recent: recentTransactions
    });
  } catch (error: any) {
    console.error("ERRO NO DASHBOARD:", error.message);
    return NextResponse.json({ 
      error: "Erro ao carregar dados do banco", 
      details: error.message 
    }, { status: 500 });
  }
}
