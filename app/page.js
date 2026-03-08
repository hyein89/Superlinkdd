export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#ffffff', 
      color: '#111111', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      textAlign: 'center', 
      padding: '2rem' 
    }}>
      
      {/* Ikon SVG Jam / Waktu Minimalis */}
      <div style={{ marginBottom: '2.5rem' }}>
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#111111" 
          strokeWidth="1.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>

      {/* Judul Utama */}
      <h1 style={{ 
        fontSize: '3.5rem', 
        fontWeight: '300', 
        marginBottom: '1rem', 
        letterSpacing: '-1px' 
      }}>
        Coming Soon
      </h1>
      
      {/* Deskripsi */}
      <p style={{ 
        fontSize: '1.1rem', 
        color: '#666666', 
        maxWidth: '420px', 
        lineHeight: '1.6' 
      }}>
        We are currently working on something amazing. Our new platform will be launching shortly.
      </p>
      
      {/* Teks Pemanis di bawah */}
      <div style={{ 
        marginTop: '4rem', 
        fontSize: '0.85rem', 
        color: '#aaaaaa', 
        letterSpacing: '3px', 
        textTransform: 'uppercase' 
      }}>
        Stay Tuned
      </div>

    </main>
  );
}
