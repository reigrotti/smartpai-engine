import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const TOTAL_TRANSACTIONS = 1000;
  const BATCH_SIZE = 100;
  const merchantId = 'e1b6f528-98e3-4d2c-87db-949d2112480b';

  const acquirers = ['Cielo', 'Rede', 'Stone'];
  const brands = ['Visa', 'Mastercard', 'Amex', 'Elo'];
  const statuses = ['AUTHORIZED', 'DECLINED', 'PENDING'];
  const names = ['Carlos Silva', 'Ana Souza', 'Bruno Lima', 'Mariana Costa', 'Roberto Santos'];

  try {
    const startTime = Date.now();
    let createdCount = 0;

    for (let i = 0; i < TOTAL_TRANSACTIONS; i += BATCH_SIZE) {
      const batchPromises = Array.from({ length: BATCH_SIZE }).map((_, index) => {
        const currentId = i + index;
        const randomAmount = Math.floor(Math.random() * 50000) + 1000;
        const randomAcquirer = acquirers[Math.floor(Math.random() * acquirers.length)];
        const randomBrand = brands[Math.floor(Math.random() * brands.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomScore = Math.floor(Math.random() * 100);

        return prisma.transaction.create({
          data: {
            pspReference: `STRESS-REF-${startTime}-${currentId}`,
            merchantId: merchantId,
            amount: randomAmount,
            currency: 'BRL',
            installments: Math.floor(Math.random() * 12) + 1,
            bin: Math.floor(100000 + Math.random() * 900000).toString(),
            brand: randomBrand,
            acquirer: randomAcquirer,
            status: randomStatus,
            recoveredByRoutIQ: randomStatus === 'AUTHORIZED' && Math.random() > 0.7,
            rawAcquirerResponse: {
              success: randomStatus === 'AUTHORIZED',
              error: randomStatus === 'DECLINED' ? 'Generic Decline Code' : null,
              providerName: randomAcquirer,
              latencyMs: Math.floor(Math.random() * 400) + 100
            },
            shopperData: { name: randomName },
            riskData: { score: randomScore }
          }
        });
      });

      await Promise.all(batchPromises);
      createdCount += BATCH_SIZE;
    }

    const duration = (Date.now() - startTime) / 1000;

    return NextResponse.json({
      success: true,
      metrics: {
        totalInserted: createdCount,
        durationSeconds: duration,
        throughputPerSecond: parseFloat((createdCount / duration).toFixed(2)),
        databaseProvider: 'PostgreSQL (Cloud SQL)'
      }
    });
  } catch (error: any) {
    console.error("Stress Test Failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
