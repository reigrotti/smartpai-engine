import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const merchant = await prisma.merchant.upsert({
    where: { publicKey: 'pk_live_routiq_001' },
    update: {},
    create: {
      name: 'Loja Alpha - Teste 2M',
      publicKey: 'pk_live_routiq_001',
      secretKey: 'sk_live_routiq_001'
    },
  })
  console.log('Merchant criado com sucesso:', merchant.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
