export default function VpnWarning() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      padding: '2rem', 
      backgroundColor: '#ffffff', 
      color: '#111111', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      textAlign: 'center'
    }}>
      
      {/* Ikon SVG Minimalis (Perisai Silang) */}
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </div>
      
      {/* Judul Utama */}
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '300', 
        marginBottom: '1rem', 
        letterSpacing: '-1px' 
      }}>
        Access Restricted
      </h1>
      
      {/* Pesan Penjelasan */}
      <p style={{ 
        fontSize: '1.1rem', 
        color: '#666666', 
        maxWidth: '420px', 
        lineHeight: '1.6', 
        marginBottom: '2rem' 
      }}>
        Our security systems have detected the use of a VPN, Proxy, or Datacenter network.
      </p>
      
      {/* Instruksi Lanjutan */}
      <p style={{ 
        fontSize: '0.9rem', 
        color: '#888888', 
        maxWidth: '380px', 
        lineHeight: '1.6' 
      }}>
        To ensure high-quality traffic, please disable any anonymizer services and use your authentic internet connection to proceed.
      </p>

    </main>
  );
}
