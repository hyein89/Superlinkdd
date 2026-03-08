// Menambahkan metadata khusus untuk halaman ini
export const metadata = {
  title: '404 - Tautan Tidak Ditemukan',
  description: 'Halaman atau tautan yang kamu cari tidak tersedia.',
};

export default function NotFound() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#111' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: '300', marginBottom: '0.5rem' }}>
        404
      </h1>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>
        Tautan yang kamu cari tidak ditemukan atau sudah tidak aktif.
      </p>
    </main>
  );
}
