'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Jika sukses, langsung arahkan ke halaman List
        window.location.href = '/list';
      } else {
        setStatus({ loading: false, error: data.message });
      }
    } catch (error) {
      setStatus({ loading: false, error: 'Network error. Please try again.' });
    }
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'sans-serif', padding: '1rem' }}>
      
      {/* Kotak Login dengan Border Super Tipis */}
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '380px', padding: '3rem 2rem', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', textAlign: 'center' }}>
        
        {/* Ikon SVG Gembok (Padlock) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '400', color: '#111', marginBottom: '0.5rem' }}>Secure Access</h1>
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2rem' }}>Please sign in to continue.</p>

        {/* Notifikasi Error Elegan Tanpa Alert */}
        {status.error && (
          <div style={{ backgroundColor: '#fff0f0', color: '#d32f2f', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid #ffe0e0' }}>
            {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" required placeholder="Username" value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            style={{ width: '100%', padding: '14px 16px', fontSize: '1rem', border: '1px solid #eaeaea', borderRadius: '8px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.border = '1px solid #111'}
            onBlur={(e) => e.target.style.border = '1px solid #eaeaea'}
          />
          
          <input 
            type="password" required placeholder="Password" value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{ width: '100%', padding: '14px 16px', fontSize: '1rem', border: '1px solid #eaeaea', borderRadius: '8px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.border = '1px solid #111'}
            onBlur={(e) => e.target.style.border = '1px solid #eaeaea'}
          />

          <button 
            type="submit" disabled={status.loading}
            style={{ marginTop: '1rem', width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '500', color: status.loading ? '#888' : '#fff', backgroundColor: status.loading ? '#f5f5f5' : '#111', border: 'none', borderRadius: '8px', cursor: status.loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            {status.loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

