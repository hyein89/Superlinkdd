// app/list/page.js
'use client';
import { useState, useEffect } from 'react';
import { siteConfig } from '../../config';

export default function ListLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // State untuk Notifikasi Melayang (Pengganti alert)
  const [toast, setToast] = useState('');

  const ITEMS_PER_PAGE = 10;
  const mainDomain = siteConfig?.domainName || 'tes.eu.org';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000); // Hilang otomatis dalam 3 detik
  };

  const fetchLinks = async (pageIndex) => {
    setLoading(true);
    const from = pageIndex * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/redirects?select=*&order=created_at.desc&limit=${ITEMS_PER_PAGE + 1}&offset=${from}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      const data = await response.json();
      
      if (data) {
        // Cek apakah ada data untuk halaman selanjutnya
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
    const confirmDelete = window.confirm("Yakin ingin menghapus tautan ini?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/redirects?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (response.ok) {
        showToast('Tautan berhasil dihapus');
        fetchLinks(page); // Muat ulang tabel
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
      // Untuk offer, kita beri placeholder [SUB_ID] agar kamu ingat untuk menggantinya
      finalUrl = `https://${item.subdomain}.${mainDomain}/?action=register&sub=[SUB_ID]`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(finalUrl);
      showToast('Tautan tersalin ke clipboard!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem', fontFamily: 'sans-serif', color: '#111' }}>
      
      {/* Notifikasi Melayang (Toast) */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#111', color: '#fff', padding: '12px 24px', borderRadius: '40px',
          fontSize: '0.9rem', fontWeight: '500', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {toast}
        </div>
      )}

      {/* Header Halaman */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '300', letterSpacing: '-0.5px', margin: 0 }}>
          Daftar Tautan
        </h1>
        <a href="/buat" style={{
          textDecoration: 'none', background: '#111', color: '#fff', padding: '10px 20px', 
          borderRadius: '40px', fontSize: '0.9rem', fontWeight: '500'
        }}>
          + Buat Link
        </a>
      </div>

      {/* Area Tabel (Bisa digeser horizontal di HP) */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '2rem' }}>
        {loading && links.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Memuat data...</p>
        ) : links.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Belum ada tautan yang dibuat.</p>
        ) : (
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 8px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>Tipe & Geo</th>
                <th style={{ padding: '16px 8px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>Tautan Pendek</th>
                <th style={{ padding: '16px 8px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>Target URL</th>
                <th style={{ padding: '16px 8px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee', textAlign: 'center' }}>Klik</th>
                <th style={{ padding: '16px 8px', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {links.map((item) => (
                <tr key={item.id} style={{ transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{item.tipe}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Geo: {item.geo_rule}</div>
                  </td>
                  <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', verticalAlign: 'top', wordBreak: 'break-all' }}>
                    <div style={{ fontWeight: '500', color: '#0066cc' }}>
                      {item.tipe === 'smartlink' ? `${item.subdomain}.${mainDomain}/${item.path}` : `${item.subdomain}.${mainDomain}`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                      {formatDate(item.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', verticalAlign: 'top', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={item.target_url} target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'none' }}>
                      {item.target_url}
                    </a>
                  </td>
                  <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', verticalAlign: 'top', textAlign: 'center', fontWeight: '600', fontSize: '1.2rem' }}>
                    {item.hit_count}
                  </td>
                  <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', verticalAlign: 'top', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleCopy(item)} style={{ background: '#f5f5f5', color: '#111', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Copy
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ background: '#fff0f0', color: '#d32f2f', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Area Paginasi (Prev & Next) */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))} 
          disabled={page === 0 || loading}
          style={{ background: 'transparent', color: page === 0 ? '#ccc' : '#111', border: 'none', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500', padding: '8px 16px' }}
        >
          &larr; Prev
        </button>
        
        <span style={{ fontSize: '0.9rem', color: '#888' }}>
          Halaman {page + 1}
        </span>

        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={!hasMore || loading}
          style={{ background: 'transparent', color: !hasMore ? '#ccc' : '#111', border: 'none', cursor: !hasMore ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500', padding: '8px 16px' }}
        >
          Next &rarr;
        </button>
      </div>

    </main>
  );
}
