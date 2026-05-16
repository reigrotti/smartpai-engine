import { NextResponse } from 'next/server';
import { processPayment } from '../../../lib/services/paymentService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    const secretKey = authHeader?.replace('Bearer ', '');

    if (!secretKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await processPayment({ ...body, secretKey });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API PAY ERROR]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}