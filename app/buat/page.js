'use client';
import { useState } from 'react';

// Fungsi bantuan untuk membuat string acak (huruf & angka)
const generateRandomString = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function BuatLink() {
  const [tipeLink, setTipeLink] = useState(null); // 'smartlink' atau 'offer'
  
  // State untuk form
  const [formData, setFormData] = useState({
    targetUrl: '',
    subdomain: '',
    path: '',
    subParam: ''
  });

  // Fungsi untuk mengisi input dengan string acak
  const handleRandomize = (field, length) => {
    setFormData({ ...formData, [field]: generateRandomString(length) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Siapkan data yang akan dikirim ke database Supabase
    const payload = {
      tipe: tipeLink,
      target_url: formData.targetUrl,
      subdomain: formData.subdomain,
      // Jika offer, tidak pakai path. Jika smartlink, pakai path.
      path: tipeLink === 'smartlink' ? formData.path : null, 
      // Parameter sub disimpan sementara di sini (opsional, tergantung struktur DB lanjutan)
      sub_id: tipeLink === 'offer' ? formData.subParam : null 
    };

    console.log('Siap dikirim ke Supabase:', payload);
    alert('Data link berhasil digenerate! (Cek Console)');
    // Nanti logika fetch POST ke Supabase ditaruh di sini
  };

  return (
    <main style={{ width: '100%', maxWidth: '500px', margin: '0 auto', padding: '4rem 2rem' }}>
      
      {/* HEADER & TOMBOL PILIHAN UTAMA */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '400', marginBottom: '2rem' }}>
          Generate Tautan Baru
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <button 
            onClick={() => setTipeLink('smartlink')}
            style={{
              fontSize: '1.1rem',
              fontWeight: tipeLink === 'smartlink' ? '600' : '400',
              color: tipeLink === 'smartlink' ? '#000' : '#888',
              borderBottom: tipeLink === 'smartlink' ? '2px solid #000' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'all 0.2s'
            }}
          >
            Smartlink
          </button>
          
          <button 
            onClick={() => setTipeLink('offer')}
            style={{
              fontSize: '1.1rem',
              fontWeight: tipeLink === 'offer' ? '600' : '400',
              color: tipeLink === 'offer' ? '#000' : '#888',
              borderBottom: tipeLink === 'offer' ? '2px solid #000' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'all 0.2s'
            }}
          >
            CPA Offer
          </button>
        </div>
      </div>

      {/* AREA FORM - Muncul setelah salah satu tombol diklik */}
      {tipeLink && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* 1. URL TARGET (Sama untuk keduanya) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
              URL Target / Tujuan Asli
            </label>
            <input 
              type="url" 
              placeholder="https://..." 
              value={formData.targetUrl}
              onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
              required
            />
          </div>

          {/* 2. SUBDOMAIN / STRING ACAK (Sama untuk keduanya) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: '#666' }}>
                String Acak (Subdomain)
              </label>
              <button 
                type="button" 
                onClick={() => handleRandomize('subdomain', 8)}
                style={{ fontSize: '0.75rem', color: '#0066cc', textTransform: 'none' }}
              >
                + Generate Random
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Ketik kustom atau klik generate..." 
              value={formData.subdomain}
              onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})}
              required
            />
          </div>

          {/* 3. INPUT KHUSUS SMARTLINK (PATH) */}
          {tipeLink === 'smartlink' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>
                  Number Random (Path)
                </label>
                <button 
                  type="button" 
                  onClick={() => handleRandomize('path', 10)}
                  style={{ fontSize: '0.75rem', color: '#0066cc', textTransform: 'none' }}
                >
                  + Generate Random
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Ketik kustom atau klik generate..." 
                value={formData.path}
                onChange={(e) => setFormData({...formData, path: e.target.value.toLowerCase()})}
                required
              />
            </div>
          )}

          {/* 4. INPUT KHUSUS CPA OFFER (SUB ID) */}
          {tipeLink === 'offer' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                Parameter Sub (contoh: tees)
              </label>
              <input 
                type="text" 
                placeholder="Isi identifier sub..." 
                value={formData.subParam}
                onChange={(e) => setFormData({...formData, subParam: e.target.value})}
                required
              />
            </div>
          )}

          {/* TOMBOL SUBMIT */}
          <button 
            type="submit" 
            style={{ 
              marginTop: '1rem', 
              fontSize: '1rem', 
              color: '#fff', 
              backgroundColor: '#111', 
              padding: '14px', 
              borderRadius: '4px' 
            }}
          >
            Simpan Tautan {tipeLink === 'smartlink' ? 'Smartlink' : 'CPA'}
          </button>

        </form>
      )}

    </main>
  );
}
