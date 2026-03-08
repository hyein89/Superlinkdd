import './globals.css';
import { siteConfig } from '../config';

// Konfigurasi Metadata Lengkap (SEO, Open Graph, Twitter, dan Ikon)
export const metadata = {
  title: siteConfig.siteName || 'Smartlink Manager',
  description: 'Platform manajemen tautan pintar dan pengalihan lalu lintas tingkat lanjut.',
  
  // Pengaturan Ikon (Favicon)
  icons: {
    // Pastikan kamu punya file favicon.ico, logo.png, atau logo.svg di dalam folder "public"
    icon: 'https://i.ibb.co.com/Y7q3Bv3K/5988576.png', 
    shortcut: 'https://i.ibb.co.com/Y7q3Bv3K/5988576.png',
    apple: 'https://i.ibb.co.com/Y7q3Bv3K/5988576.png', // Untuk ikon di layar HP iPhone
  },

  // Pengaturan Meta Image untuk Facebook, WhatsApp, LinkedIn, dll
  openGraph: {
    title: siteConfig.siteName || 'Smartlink Manager',
    description: 'Platform manajemen tautan pintar dan pengalihan lalu lintas tingkat lanjut.',
    url: `https://${siteConfig.domainName}`,
    siteName: siteConfig.siteName || 'Smartlink Manager',
    images: [
      {
        // Saya beri placeholder gambar abstrak elegan dari Unsplash. 
        // Silakan ganti URL ini dengan URL gambar bannermu sendiri nanti.
        url: 'https://i.ibb.co.com/d4kpZf8b/og-image-1.png', 
        width: 1200,
        height: 630,
        alt: 'Cover Image Default',
      },
    ],
    type: 'website',
  },

  // Pengaturan Meta Image khusus untuk Twitter (X)
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.siteName || 'Smartlink Manager',
    description: 'Platform manajemen tautan pintar dan pengalihan lalu lintas tingkat lanjut.',
    images: ['https://i.ibb.co.com/d4kpZf8b/og-image-1.png'], 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
