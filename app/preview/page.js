// app/preview/page.js

export const metadata = {
  // Gunakan judul yang sangat normal dan tidak agresif
  title: 'Berita Harian & Informasi Terbaru',
  description: 'Membaca artikel dan informasi terbaru hari ini. Temukan berbagai topik menarik seputar gaya hidup, teknologi, dan hiburan.',
  openGraph: {
    title: 'Berita Harian & Informasi Terbaru',
    description: 'Membaca artikel dan informasi terbaru hari ini. Temukan berbagai topik menarik seputar gaya hidup, teknologi, dan hiburan.',
    // SANGAT PENTING: Gunakan gambar pemandangan, gambar abstrak, atau logo yang sangat aman. Jangan gambar cewek/video!
    images: ['https://i.ibb.co.com/20SyZc40/622027260-910805528561278-4101000050464278438-n.jpg'], 
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berita Harian & Informasi Terbaru',
    description: 'Membaca artikel dan informasi terbaru hari ini.',
    images: ['https://i.ibb.co.com/20SyZc40/622027260-910805528561278-4101000050464278438-n.jpg'],
  }
};

export default function FakePreview() {
  // Kita isi halamannya dengan teks palsu (Lorem Ipsum) agar bot FB melihat ini sebagai artikel sungguhan, bukan halaman kosong.
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', color: '#333' }}>
      <h1>Berita Harian & Informasi Terbaru</h1>
      <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
        Selamat datang di portal informasi kami. Hari ini kita akan membahas berbagai topik menarik yang sedang hangat diperbincangkan. 
        Teknologi terus berkembang pesat, membawa perubahan signifikan dalam cara kita bekerja dan bersosialisasi. 
        Di sisi lain, gaya hidup modern juga menuntut kita untuk lebih adaptif.
      </p>
      <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </main>
  );
}
