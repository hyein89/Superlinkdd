'use client';
import { useState, useEffect } from 'react';
import { siteConfig } from '../../config';

export default function ListLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [toast, setToast] = useState('');

  const ITEMS_PER_PAGE = 10;
  const mainDomain = siteConfig?.domainName || 'tes.eu.org';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchLinks = async (pageIndex) => {
    setLoading(true);
    const from = pageIndex * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/redirects?select=*&order=created_at.desc&limit=${ITEMS_PER_PAGE + 1}&offset=${from}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      
      const data = await response.json();
      
      if (data) {
        if (data.length > ITEMS_PER_PAGE) {
          setHasMore(true);
          setLinks(data.slice(0, ITEMS_PER_PAGE));
        } else {
          setHasMore(false);
          setLinks(data);
        }
      }
    } catch (error) {
      showToast('Gagal memuat data tautan');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks(page);
  }, [page]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Hapus tautan ini secara permanen?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/redirects?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });

      if (response.ok) {
        showToast('Tautan berhasil dihapus');
        fetchLinks(page); 
      } else {
        showToast('Gagal menghapus tautan');
      }
    } catch (error) {
      showToast('Terjadi kesalahan jaringan');
    }
  };

  const handleCopy = (item) => {
    let finalUrl = '';
    if (item.tipe === 'smartlink') {
      finalUrl = `https://${item.subdomain}.${mainDomain}/${item.path}`;
    } else {
      const sub = item.sub_param || 'tes'; 
      finalUrl = `https://${item.subdomain}.${mainDomain}/?action=register&sub=${sub}`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(finalUrl);
      showToast('Tautan berhasil disalin!');
    }
  };

  const formatDateIndo = (dateString) => {
    const date = new Date(dateString);
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const jam = String(date.getHours()).padStart(2, '0');
    const menit = String(date.getMinutes()).padStart(2, '0');
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}, ${jam}:${menit} WIB`;
  };

  return (
    // Tambahan overflowX: 'hidden' dan boxSizing untuk mencegah layar bisa digeser ke kanan
    <main style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '3rem 2rem', fontFamily: 'sans-serif', color: '#111', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Notifikasi Toast Elegan */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#111', color: '#fff', padding: '12px 24px', borderRadius: '40px',
          fontSize: '0.9rem', fontWeight: '500', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap'
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '300', letterSpacing: '-1px', margin: 0 }}>
          Daftar Tautan
        </h1>
        <a href="/buat" style={{
          textDecoration: 'none', background: '#111', color: '#fff', padding: '12px 24px', 
          borderRadius: '40px', fontSize: '0.9rem', fontWeight: '500'
        }}>
          + Buat Link
        </a>
      </div>

      {/* Area Daftar (Desain Bersih, Anti-Kepotong) */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {loading && links.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Memuat data...</p>
        ) : links.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Belum ada tautan yang dibuat.</p>
        ) : (
          links.map((item) => (
            <div key={item.id} style={{ 
              padding: '1.5rem 0', 
              borderBottom: '1px solid #eaeaea', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              width: '100%' 
            }}>
              
              {/* Baris 1: Meta Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {item.tipe} • Geo: {item.geo_rule}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                  {formatDateIndo(item.created_at)}
                </span>
              </div>

              {/* Baris 2: Link Utama (Otomatis turun baris jika kepanjangan) */}
              <div style={{ fontSize: '1.15rem', fontWeight: '500', color: '#0066cc', wordBreak: 'break-all', lineHeight: '1.4' }}>
                {item.tipe === 'smartlink' 
                  ? `${item.subdomain}.${mainDomain}/${item.path}` 
                  : `${item.subdomain}.${mainDomain}/?action=register&sub=${item.sub_param || 'tes'}`
                }
              </div>

              {/* Baris 3: Target Asli (Otomatis turun baris, anti kepotong) */}
              <div style={{ fontSize: '0.85rem', color: '#666', wordBreak: 'break-all', lineHeight: '1.5' }}>
                Target: {item.target_url}
              </div>

              {/* Baris 4: Klik & Tombol Aksi */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '1rem' }}>
                
                {/* SVG Ikon Klik Menggantikan Emoji Api */}
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: '600', color: '#111' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                    <path d="M13 13l6 6"></path>
                  </svg>
                  {item.hit_count} Klik
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleCopy(item)} style={{ background: '#f5f5f5', color: '#111', border: 'none', padding: '8px 16px', borderRadius: '40px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                    Copy
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: '#fff0f0', color: '#d32f2f', border: 'none', padding: '8px 16px', borderRadius: '40px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                    Delete
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Paginasi Elegan */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))} 
          disabled={page === 0 || loading}
          style={{ background: 'transparent', color: page === 0 ? '#ccc' : '#111', border: 'none', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500' }}
        >
          &larr; Prev
        </button>
        
        <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: '500' }}>
          Halaman {page + 1}
        </span>

        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={!hasMore || loading}
          style={{ background: 'transparent', color: !hasMore ? '#ccc' : '#111', border: 'none', cursor: !hasMore ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500' }}
        >
          Next &rarr;
        </button>
      </div>

    </main>
  );
}
