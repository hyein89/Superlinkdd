import './globals.css';

// Metadata ini berguna untuk judul di tab browser dan SEO dasar
export const metadata = {
  title: 'Sistem Redirect',
  description: 'Smartlink dan Offer Redirect System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {/* 'children' di sini akan otomatis diisi oleh isi dari page.js atau not-found.js */}
        {children}
      </body>
    </html>
  );
}
