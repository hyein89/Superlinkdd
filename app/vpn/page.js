// app/vpn/page.js

export default function VpnWarning() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#ffffff',
      color: '#111111',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: '300', marginBottom: '1rem', letterSpacing: '-2px' }}>
        Akses Ditolak
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '500px', lineHeight: '1.6' }}>
        Sistem kami mendeteksi penggunaan VPN, Proxy, atau jaringan Datacenter. 
        <br /><br />
        Silakan matikan VPN kamu dan gunakan koneksi internet asli untuk melanjutkan.
      </p>
    </main>
  );
}
