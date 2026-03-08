import { NextResponse } from 'next/server';
import { siteConfig } from './config';

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Mengambil domain dari config.js
  const mainDomain = siteConfig.domainName; 

  // Kunci Supabase diambil dari Environment Variables Vercel
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Cek apakah ini akses subdomain (contoh: stringacak.tes.eu.org)
  if (hostname.includes(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');
    const path = url.pathname; // contoh: /numberrondom
    
    // Ambil query parameter untuk Offer
    const action = url.searchParams.get('action');
    const sub = url.searchParams.get('sub'); // contoh: tees

    try {
      // 1. Siapkan URL pencarian ke Supabase (REST API sangat cepat di Vercel Edge)
      let queryUrl = `${supabaseUrl}/rest/v1/redirects?select=*&subdomain=eq.${subdomain}`;
      
      // Tentukan logika pencarian berdasarkan format URL yang diakses
      if (action === 'register' && sub) {
        // Skenario Offer: Cari subdomain dengan tipe 'offer'
        queryUrl += `&tipe=eq.offer`;
      } else if (path.length > 1) {
        // Skenario Smartlink: Hilangkan garis miring awal (/) agar cocok dengan database
        const cleanPath = path.substring(1); 
        queryUrl += `&path=eq.${cleanPath}&tipe=eq.smartlink`;
      } else {
        // Jika hanya akses subdomain kosong tanpa path atau parameter
        url.pathname = '/404';
        return NextResponse.rewrite(url);
      }

      // 2. Tarik data dari Supabase
      const response = await fetch(queryUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      const data = await response.json();

      // 3. Jika link ditemukan di database
      if (data && data.length > 0) {
        const redirectData = data[0];
        
        // --- PROSES HIT COUNT DI LATAR BELAKANG ---
        // Kita tidak memakai 'await' di sini agar pengunjung langsung dialihkan 
        // tanpa harus menunggu database selesai di-update.
        fetch(`${supabaseUrl}/rest/v1/redirects?id=eq.${redirectData.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ hit_count: redirectData.hit_count + 1 })
        }).catch(err => console.error("Gagal update hit count"));

        // --- EKSEKUSI REDIRECT ---
        
        // Skenario Offer: Gabungkan URL target dengan parameter sub (id)
        // Skenario Offer: Tempel langsung parameter sub ke ujung URL target
        if (action === 'register' && sub && redirectData.tipe === 'offer') {
           // Ini akan langsung menggabungkan "https://www.google.com/?tes=" dengan "Konha"
           const finalOfferUrl = redirectData.target_url + sub;
           return NextResponse.redirect(finalOfferUrl, 302);
        }
        
        // Skenario Smartlink: Langsung tembak ke middle link
        if (redirectData.tipe === 'smartlink') {
           return NextResponse.redirect(redirectData.target_url, 301);
        }
      }

      // 4. Jika data tidak ada di database, lempar ke 404
      url.pathname = '/404';
      return NextResponse.rewrite(url);

    } catch (error) {
      // Jika terjadi error sistem, amankan dengan melempar ke 404
      console.error("Middleware Error:", error);
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  // Jika yang diakses adalah domain utama (tes.eu.org) biarkan lolos ke halaman Coming Soon / Buat
  return NextResponse.next();
}

// Aturan agar middleware tidak mencegat file statis (gambar, css, favicon)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
