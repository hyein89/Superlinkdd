import { siteConfig } from '../config';

export default function Home() {
  return (
    <main style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '400', marginBottom: '1rem' }}>
        {siteConfig.siteName}
      </h1>
      <p style={{ color: '#666' }}>
        Sistem sedang dalam tahap pengembangan.
      </p>
    </main>
  );
}
