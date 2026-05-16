import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Limpeza de segurança (Apenas registros de teste)
    await prisma.transaction.deleteMany({});
    await prisma.merchant.deleteMany({});

    // 2. Criar o Merchant Corporativo Homologado
    const merchant = await prisma.merchant.create({
      data: {
        id: 'e1b6f528-98e3-4d2c-87db-949d2112480b',
        name: 'LOJA ALPHA RETAIL',
        publicKey: 'pub_live_alpha8899',
        secretKey: 'sec_live_alpha1122',
        status: 'ACTIVE'
      }
    });

    // 3. Cenário 1: Sucesso Orgânico via Cielo (Visa)
    await prisma.transaction.create({
      data: {
        pspReference: 'RIQ-VISA-OK88',
        merchantId: merchant.id,
        amount: 15000, 
        status: 'AUTHORIZED',
        acquirer: 'Cielo',
        recoveredByRoutIQ: false,
        bin: '411111',
        brand: 'Visa',
        rawAcquirerResponse: { success: true, error: null, providerName: 'Cielo', isSoftDecline: false },
        shopperData: { name: 'Reinaldo Grotti' },
        riskData: { score: 12 }
      }
    });

    // 4. Cenário 2: Silent Recovery (Falha na Cielo roteada para a Rede)
    await prisma.transaction.create({
      data: {
        pspReference: 'RIQ-MAST-REC99',
        merchantId: merchant.id,
        amount: 25099, 
        status: 'AUTHORIZED',
        acquirer: 'Rede',
        recoveredByRoutIQ: true,
        bin: '555555',
        brand: 'Mastercard',
        rawAcquirerResponse: { success: true, error: 'Soft Decline Decimals', providerName: 'Rede', isSoftDecline: true },
        shopperData: { name: 'Caroline Silva Verassani' },
        riskData: { score: 25 }
      }
    });

    // 5. Cenário 3: Hard Decline Guard (Fraude Barrada)
    await prisma.transaction.create({
      data: {
        pspReference: 'RIQ-AMEX-BLOCK00',
        merchantId: merchant.id,
        amount: 89000, 
        status: 'DECLINED',
        acquirer: 'Rede',
        recoveredByRoutIQ: false,
        bin: '371234',
        brand: 'Amex',
        rawAcquirerResponse: { success: false, error: 'Hard Decline - Fraud Suspect', providerName: 'Rede', isSoftDecline: false },
        shopperData: { name: 'Desconhecido' },
        riskData: { score: 99 }
      }
    });

    return NextResponse.json({ success: true, message: 'Massa do Pitch injetada com JSONB nativo com sucesso!' });
  } catch (error: any) {
    console.error("Erro interno no seed de desenvolvimento:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}