'use client';
import { useState } from 'react';

export default function BuatLink() {
  const [formData, setFormData] = useState({
    subdomain: '',
    path: '',
    targetUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logika kirim data ke Supabase akan ditaruh di sini
    console.log('Menyimpan data:', formData);
    alert('Disimpan (Simulasi)');
  };

  return (
    <main style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: '2rem' }}>
        Buat Tautan Baru
      </h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <input 
            type="text" 
            placeholder="String Acak (Subdomain)" 
            value={formData.subdomain}
            onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
            required
          />
        </div>
        
        <div>
          <input 
            type="text" 
            placeholder="Number Random (Path) - Opsional" 
            value={formData.path}
            onChange={(e) => setFormData({...formData, path: e.target.value})}
          />
        </div>

        <div>
          <input 
            type="url" 
            placeholder="URL Target / Offer" 
            value={formData.targetUrl}
            onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
            required
          />
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>
          Simpan Tautan
        </button>
      </form>
    </main>
  );
}
