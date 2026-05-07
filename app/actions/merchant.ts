'use server'
import { prisma } from '../../lib/prisma'

export async function saveMerchantKeys(formData: { publicKey: string, secretKey: string }) {
  if (!formData.publicKey || !formData.secretKey) {
    return { success: false, error: 'Chaves obrigatórias.' }
  }

  try {
    const merchant = await prisma.merchant.upsert({
      where: { id: 'default-merchant' },
      update: {
        publicKey: formData.publicKey,
        secretKey: formData.secretKey,
      },
      create: {
        id: 'default-merchant',
        name: 'Lojista Principal',
        publicKey: formData.publicKey,
        secretKey: formData.secretKey,
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Erro no Prisma:', error)
    return { success: false, error: 'Erro de conexão.' }
  }
}
