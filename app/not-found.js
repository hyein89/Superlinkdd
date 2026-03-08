
export const metadata = {
  title: '500 Internal Server Error',
  description: 'The server encountered an unexpected condition.',
  openGraph: {
    title: '500 Internal Server Error',
    description: 'The server encountered an unexpected condition.',
    // Mengosongkan gambar secara paksa agar FB tidak menarik gambar layout
    images: [], 
  },
  twitter: {
    card: 'summary',
    title: '500 Internal Server Error',
    description: 'The server encountered an unexpected condition.',
    // Mengosongkan gambar secara paksa
    images: [], 
  }
};

export default function NotFound() {
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
      
      {/* Ikon SVG Server Minimalis */}
      <div style={{ marginBottom: '2rem' }}>
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
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
          <path d="M12 22v-4"></path>
          <path d="M12 10V6"></path>
        </svg>
      </div>

      <h1 style={{ 
        fontSize: '3.5rem', 
        fontWeight: '300', 
        marginBottom: '0.5rem', 
        letterSpacing: '-1px' 
      }}>
        500
      </h1>
      
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '400', 
        color: '#333333', 
        marginBottom: '1.5rem' 
      }}>
        Internal Server Error
      </h2>
      
      <p style={{ 
        fontSize: '1rem', 
        color: '#888888', 
        maxWidth: '400px', 
        lineHeight: '1.6' 
      }}>
        The server encountered an unexpected condition that prevented it from fulfilling the request.
      </p>

    </main>
  );
}
