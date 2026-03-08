import { NextResponse } from 'next/server';
import { siteConfig } from './config';

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Mengambil domain dari file config.js
  const mainDomain = siteConfig.domainName; 
  
  // Mengambil kunci dari environment Vercel
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // HANYA proses jika yang diakses adalah subdomain (misal: stringacak.tes.eu.org)
  if (hostname.includes(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');
    const path = url.pathname; 
    
    const action = url.searchParams.get('action');
    const sub = url.searchParams.get('sub'); 

    // ==========================================
    // SISTEM KEAMANAN: DETEKSI VPN/PROXY SAJA
    // ==========================================
    // Ambil IP asli, WAJIB memprioritaskan header dari Cloudflare (cf-connecting-ip)
    const clientIp = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.ip;

    if (clientIp) {
      try {
        // HANYA cek 'proxy'. Deteksi 'hosting' DIHAPUS total agar IP HP/Cloudflare tidak diblokir.
        // Menggunakan cache: 'no-store' agar Vercel selalu mengecek IP terbaru.
        const ipCheck = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,proxy`, {
          cache: 'no-store'
        });
        const ipData = await ipCheck.json();

        // BLOKIR HANYA JIKA BENAR-BENAR MENGGUNAKAN VPN/PROXY
        if (ipData.status === 'success' && ipData.proxy === true) {
          const vpnResponse = NextResponse.redirect(`https://${mainDomain}/vpn`, 307);
          vpnResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          return vpnResponse;
        }
      } catch (e) {
        console.error("Gagal cek IP API:", e);
        // Jika API error, biarkan lolos agar pengunjung asli tidak terganggu
      }
    }
    // ==========================================

    try {
      // Siapkan URL pencarian ke Supabase
      let queryUrl = `${supabaseUrl}/rest/v1/redirects?select=*&subdomain=eq.${subdomain}`;
      
      // Filter tipe pencarian
      if (action === 'register' && sub) {
        queryUrl += `&tipe=eq.offer`;
      } else if (path.length > 1) {
        const cleanPath = path.substring(1); 
        queryUrl += `&path=eq.${cleanPath}&tipe=eq.smartlink`;
      } else {
        url.pathname = '/404';
        return NextResponse.rewrite(url);
      }

      // Tarik data dari Supabase (tanpa cache)
      const response = await fetch(queryUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        cache: 'no-store'
      });

      const data = await response.json();

      // Jika Tautan Ditemukan di Database
      if (data && data.length > 0) {
        const redirectData = data[0];
        
        // --- HIT COUNT DI LATAR BELAKANG ---
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

        let targetResponse;

        // --- EKSEKUSI PENGALIHAN (REDIRECT) ---
        
        // Skenario Offer: Tempel langsung parameter sub ke ujung URL asli
        if (action === 'register' && sub && redirectData.tipe === 'offer') {
           const finalOfferUrl = redirectData.target_url + sub;
           targetResponse = NextResponse.redirect(finalOfferUrl, 307);
        } 
        
        // Skenario Smartlink
        else if (redirectData.tipe === 'smartlink') {
           targetResponse = NextResponse.redirect(redirectData.target_url, 307);
        }

        // Terapkan header anti-cache agar browser pengunjung selalu mengecek ke Vercel, bukan mengingat yang lama
        if (targetResponse) {
          targetResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          return targetResponse;
        }
      }

      // Jika data tidak ada, lempar ke halaman 404
      url.pathname = '/404';
      return NextResponse.rewrite(url);

    } catch (error) {
      console.error("Middleware Error:", error);
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  // Biarkan lolos jika yang diakses adalah domain utama (halaman buat/coming soon)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
