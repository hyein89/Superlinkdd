'use client';
import { useState } from 'react';
import { siteConfig } from '../../config';

const generateRandomString = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function BuatLink() {
  const [tipeLink, setTipeLink] = useState(null);
  const [formData, setFormData] = useState({ 
    targetUrl: '', subdomain: '', path: '', subParam: '', 
    geoRule: 'all', geoCustom: '' 
  });
  
  const [status, setStatus] = useState({ loading: false, error: null });
  const [resultUrl, setResultUrl] = useState(null);
  const [copyText, setCopyText] = useState('Bagikan / Salin Tautan');

  const mainDomain = siteConfig?.domainName || 'tes.eu.org';

  const handleRandomize = (field, length) => {
    setFormData({ ...formData, [field]: generateRandomString(length) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });
    setResultUrl(null);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Masukkan data geo ke payload
    const payload = {
      tipe: tipeLink,
      target_url: formData.targetUrl,
      subdomain: formData.subdomain,
      path: tipeLink === 'smartlink' ? formData.path : null,
      geo_rule: formData.geoRule,
      geo_custom: formData.geoCustom.toUpperCase() // Pastikan kode negara jadi huruf besar (US, ID)
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/redirects`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        let finalUrl = tipeLink === 'smartlink' 
          ? `https://${formData.subdomain}.${mainDomain}/${formData.path}`
          : `https://${formData.subdomain}.${mainDomain}/?action=register&sub=${formData.subParam}`;
        
        setResultUrl(finalUrl);
        setStatus({ loading: false, error: null });
        setFormData({ targetUrl: '', subdomain: '', path: '', subParam: '', geoRule: 'all', geoCustom: '' });
      } else {
        const errorData = await response.json();
        setStatus({ loading: false, error: 'Gagal: ' + (errorData.message || 'Cek koneksi') });
      }
    } catch (error) {
      setStatus({ loading: false, error: 'Terjadi kesalahan jaringan.' });
    }
  };

  const handleShare = async () => {
    if (!resultUrl) return;
    const title = siteConfig?.siteName || 'Tautan Baru';
    if (navigator.share) {
      navigator.share({ title: title, url: resultUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(resultUrl);
      setCopyText('Tersalin!');
      setTimeout(() => setCopyText('Bagikan / Salin Tautan'), 3000); 
    }
  };

  return (
    <main style={{ width: '100%', maxWidth: '500px', margin: '0 auto', padding: '4rem 2rem', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '300', marginBottom: '2.5rem', letterSpacing: '-0.5px' }}>
          Generate Tautan
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
          <button onClick={() => { setTipeLink('smartlink'); setResultUrl(null); }}
            style={{ fontSize: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: tipeLink === 'smartlink' ? '600' : '400', color: tipeLink === 'smartlink' ? '#111' : '#aaa', transition: 'color 0.2s' }}>
            SMARTLINK
          </button>
          <button onClick={() => { setTipeLink('offer'); setResultUrl(null); }}
            style={{ fontSize: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: tipeLink === 'offer' ? '600' : '400', color: tipeLink === 'offer' ? '#111' : '#aaa', transition: 'color 0.2s' }}>
            CPA OFFER
          </button>
        </div>
      </div>

      {status.error && <p style={{ color: '#d32f2f', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>{status.error}</p>}

      {resultUrl && (
        <div style={{ marginBottom: '3rem', padding: '2rem', backgroundColor: '#fafafa', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>Tautan berhasil dibuat:</p>
          <a href={resultUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '1.1rem', color: '#111', fontWeight: '500', wordBreak: 'break-all', textDecoration: 'none', marginBottom: '1.5rem' }}>
            {resultUrl}
          </a>
          <button onClick={handleShare} style={{ background: '#111', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '40px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
            {copyText}
          </button>
        </div>
      )}

      {tipeLink && !resultUrl && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>URL Target Tujuan</label>
            <input type="url" required placeholder="https://..." value={formData.targetUrl} onChange={(e) => setFormData({...formData, targetUrl: e.target.value})} style={{ fontSize: '1.2rem', padding: '8px 0', border: 'none', outline: 'none', background: 'transparent', color: '#111' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Subdomain Acak</label>
              <button type="button" onClick={() => handleRandomize('subdomain', 8)} style={{ fontSize: '0.8rem', background: 'transparent', border: 'none', color: '#0066cc', cursor: 'pointer' }}>Generate</button>
            </div>
            <input type="text" required placeholder="Ketik atau generate..." value={formData.subdomain} onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})} style={{ fontSize: '1.2rem', padding: '8px 0', border: 'none', outline: 'none', background: 'transparent', color: '#111' }} />
          </div>

          {tipeLink === 'smartlink' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Path Random</label>
                <button type="button" onClick={() => handleRandomize('path', 10)} style={{ fontSize: '0.8rem', background: 'transparent', border: 'none', color: '#0066cc', cursor: 'pointer' }}>Generate</button>
              </div>
              <input type="text" required placeholder="Ketik atau generate..." value={formData.path} onChange={(e) => setFormData({...formData, path: e.target.value.toLowerCase()})} style={{ fontSize: '1.2rem', padding: '8px 0', border: 'none', outline: 'none', background: 'transparent', color: '#111' }} />
            </div>
          )}

          {tipeLink === 'offer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Parameter Sub ID</label>
              <input type="text" required placeholder="Misal: tees" value={formData.subParam} onChange={(e) => setFormData({...formData, subParam: e.target.value})} style={{ fontSize: '1.2rem', padding: '8px 0', border: 'none', outline: 'none', background: 'transparent', color: '#111' }} />
            </div>
          )}

          {/* FITUR GEO FILTER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Filter Negara (Geo-Targeting)</label>
            <select 
              value={formData.geoRule} 
              onChange={(e) => setFormData({...formData, geoRule: e.target.value})}
              style={{ fontSize: '1.1rem', padding: '8px 0', border: 'none', borderBottom: '1px solid #eee', outline: 'none', background: 'transparent', color: '#111', cursor: 'pointer' }}
            >
              <option value="all">Bebas (Semua Negara)</option>
              <option value="tier1">Hanya Tier 1 (US, GB, CA, AU, NZ)</option>
              <option value="tier2">Hanya Tier 2 (DE, FR, IT, ES, dll)</option>
              <option value="tier3">Hanya Tier 3 (ID, IN, BR, PH, dll)</option>
              <option value="custom_allow">Hanya Izinkan Negara Tertentu (Manual)</option>
              <option value="custom_block">Blokir Negara Tertentu (Manual)</option>
            </select>
          </div>

          {/* INPUT MANUAL JIKA PILIH CUSTOM */}
          {(formData.geoRule === 'custom_allow' || formData.geoRule === 'custom_block') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Masukkan Kode Negara (Pisahkan dengan koma)
              </label>
              <input 
                type="text" required placeholder="Contoh: ID, US, SG" value={formData.geoCustom}
                onChange={(e) => setFormData({...formData, geoCustom: e.target.value})}
                style={{ fontSize: '1.2rem', padding: '8px 0', border: 'none', outline: 'none', background: 'transparent', color: '#111' }}
              />
            </div>
          )}

          <button type="submit" disabled={status.loading} style={{ marginTop: '1rem', fontSize: '1rem', color: status.loading ? '#aaa' : '#fff', backgroundColor: status.loading ? '#eee' : '#111', padding: '16px', borderRadius: '40px', border: 'none', cursor: status.loading ? 'not-allowed' : 'pointer', fontWeight: '500', transition: 'all 0.2s' }}>
            {status.loading ? 'Menyimpan...' : `Simpan ${tipeLink === 'smartlink' ? 'Smartlink' : 'CPA Offer'}`}
          </button>
        </form>
      )}
    </main>
  );
}
