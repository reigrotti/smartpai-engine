'use client';
import { useEffect, useRef, useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const vgsFormRef = useRef<any>(null);

  useEffect(() => {
    // 1. Só inicializa se o script estiver pronto e se já não houver uma instância
    const initVGS = () => {
      if (typeof window !== 'undefined' && (window as any).VGSCollect && !vgsFormRef.current) {
        const form = (window as any).VGSCollect.create('tntjjh2tydt', 'sandbox', () => {});
        vgsFormRef.current = form;

        const css = {
          'font-family': 'Inter, sans-serif',
          'font-size': '16px',
          'color': '#FFFFFF',
          '&::placeholder': { color: '#475569' },
          'padding': '0 15px',
        };

        form.field('#vgs-card-container', {
          type: 'card-number',
          name: 'card_number',
          placeholder: '4111 1111 1111 1111',
          css: css
        });

        form.field('#vgs-cvc-container', {
          type: 'card-security-code',
          name: 'card_cvc',
          placeholder: '123',
          css: css
        });
      }
    };

    // Pequeno delay para garantir que o DOM estabilizou
    const timer = setTimeout(initVGS, 300);
    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vgsFormRef.current || loading) return;
    setLoading(true);

    vgsFormRef.current.tokenize(async (status: number, response: any) => {
      if (status === 200) {
        try {
          await fetch('/api/pay', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test1234' 
            },
            body: JSON.stringify({
              vgsToken: response.data.card_number,
              amount: 100.00,
              merchantId: 'test-merchant-001'
            }),
          });
          alert('🔥 SUCESSO! Sprint 2 finalizada com perfeição.');
        } catch (err) {
          alert('Token gerado com sucesso, mas API local falhou.');
        }
      } else {
        alert('VGS recusou os dados. Tente digitar pausadamente.');
      }
      setLoading(false);
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md p-10 bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-[0_0_30px_rgba(37,99,235,0.4)] text-xl">R</div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Smart<span className="text-blue-500">Checkout</span></h2>
        </div>
        
        <form onSubmit={handlePayment} className="flex flex-col gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cartão de Crédito</label>
            {/* Divs puras sem nenhuma lógica React dentro delas para não bugar o VGS */}
            <div id="vgs-card-container" className="h-16 w-full bg-slate-950 border border-slate-800 rounded-2xl flex items-center shadow-inner overflow-hidden"></div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CVC</label>
            <div id="vgs-cvc-container" className="h-16 w-full bg-slate-950 border border-slate-800 rounded-2xl flex items-center shadow-inner overflow-hidden"></div>
          </div>

          <button type="submit" disabled={loading} className="h-16 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50">
            {loading ? 'VALIDANDO PCI...' : 'CONFIRMAR PAGAMENTO'}
          </button>
        </form>
      </div>
    </div>
  );
}
