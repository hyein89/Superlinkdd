// app/preview/page.js

// Di sinilah kamu memasukkan judul dan gambar pancingan (clickbait)
export const metadata = {
  title: 'Video Viral Terbaru (Full HD)',
  description: 'Tonton video selengkapnya di sini. Durasi full tanpa potongan...',
  openGraph: {
    title: 'Video Viral Terbaru (Full HD)',
    description: 'Tonton video selengkapnya di sini. Durasi full tanpa potongan...',
    // Ganti URL ini dengan URL gambar JPG/PNG yang menarik (misal gambar tombol Play video)
    images: ['https://i.imgur.com/ContohGambarKamu.jpg'], 
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Viral Terbaru (Full HD)',
    description: 'Tonton video selengkapnya di sini. Durasi full tanpa potongan...',
    images: ['https://i.imgur.com/ContohGambarKamu.jpg'],
  }
};

export default function FakePreview() {
  // Tampilan fisiknya kita buat kosong saja atau pura-pura loading
  // Karena manusia asli tidak akan pernah sampai ke halaman ini.
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#666' }}>Redirecting...</p>
    </div>
  );
}
