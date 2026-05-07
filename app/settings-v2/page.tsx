'use client'

import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { saveMerchantKeys } from '../actions/merchant';

export default function SettingsV2() {
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keys, setKeys] = useState({
    publicKey: '',
    secretKey: ''
  });

  // 1. Simular o carregamento inicial (Em um app real, faríamos um fetch aqui)
  // Por enquanto, vamos permitir que o usuário comece a digitar
  
  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    const result = await saveMerchantKeys(keys);
    
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert("Erro ao salvar no banco. Verifique a conexão.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Configurações de API</h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Gerencie suas chaves de integração com a RoutIQ.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Public Key */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e4e4e7' }}>Chave Pública (Public Key)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={16} style={{ position: 'absolute', left: '12px', color: '#71717a' }} />
              <input 
                type="text"
                value={keys.publicKey}
                onChange={(e) => setKeys({...keys, publicKey: e.target.value})}
                placeholder="pk_live_..."
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px 12px 10px 40px', color: 'white', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Secret Key */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e4e4e7' }}>Chave Secreta (Secret Key)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={16} style={{ position: 'absolute', left: '12px', color: '#71717a' }} />
              <input 
                type={showSecret ? "text" : "password"}
                value={keys.secretKey}
                onChange={(e) => setKeys({...keys, secretKey: e.target.value})}
                placeholder="sk_live_..."
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px 48px 10px 40px', color: 'white', fontSize: '14px', outline: 'none' }}
              />
              <button 
                onClick={() => setShowSecret(!showSecret)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={loading}
            style={{ 
              marginTop: '12px',
              backgroundColor: saved ? '#166534' : '#fafafa', 
              color: saved ? '#ffffff' : '#09090b', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '12px', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (saved ? <CheckCircle2 size={18} /> : <Save size={18} />)}
            {loading ? 'Salvando no Banco...' : (saved ? 'Salvo com Sucesso!' : 'Salvar Chaves')}
          </button>

          <p style={{ fontSize: '12px', color: '#71717a', textAlign: 'center' }}>
            As chaves são armazenadas de forma segura no Google Cloud SQL.
          </p>

        </div>
      </div>
    </div>
  )
}
