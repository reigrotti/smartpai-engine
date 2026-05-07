# SmartPai Engine - Guia de Desenvolvimento

## 🛠 Ambiente & Comandos
- **Plataforma:** Linux Container (Penguin) - ChromeOS
- **Portas:** 3000 (Next.js), 5555 (Prisma Studio)
- **Exposição:** Ngrok (HTTPS obrigatório para VGS/Webhooks)
- **Comando Dev:** `npm run dev`
- **Comando Ngrok:** `ngrok http 3000 --domain=onset-crushable-handprint.ngrok-free.dev`

## 🔒 PCI Compliance & Segurança
- **Provedor:** Very Good Security (VGS)
- **Vault ID:** `tntjjh2tydt` (Ambiente: Sandbox)
- **Checkout Seguro:** Localizado em `/checkout` usando VGS Collect SDK.

## 📁 Estrutura Sprint 2 (Concluída)
- `app/layout.tsx`: Sidebar administrativa e carregamento do SDK VGS.
- `app/checkout/page.tsx`: Formulário de captura segura de dados sensíveis.
- `app/api/pay/route.ts`: Engine de roteamento (Cielo/Rede).

## 🚀 Próximos Passos (Sprint 3)
- [ ] Configurar Webhooks para PIX em `api/webhooks/pix`.
- [ ] Implementar Failover dinâmico entre adquirentes.
- [ ] Whitelisting de domínio no painel VGS Organization Settings.

## 📝 Guia de Estilo
- **Linguagem:** TypeScript / Next.js 14 (App Router)
- **UI:** Tailwind CSS (Dark Theme/High Contrast)
- **Database:** Prisma ORM
