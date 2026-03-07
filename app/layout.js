import './globals.css';
import { siteConfig } from '../config'; // <-- Panggil config, perhatikan ../ karena ada di dalam folder app

// Title dan Description sekarang otomatis ikut file config
export const metadata = {
  title: siteConfig.siteName,
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
