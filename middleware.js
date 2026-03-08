import { NextResponse } from 'next/server';
import { siteConfig } from './config';

// Daftar Negara Berdasarkan Tier
const TIER_1 = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];
const TIER_2 = ['DE', 'FR', 'IT', 'ES', 'JP', 'SG', 'KR', 'NL', 'SE', 'CH', 'NO', 'DK', 'FI'];
const TIER_3 = ['IN', 'ID', 'BR', 'NG', 'PH', 'MX', 'ZA', 'VN', 'TH', 'MY', 'AR', 'CO'];

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  const mainDomain = siteConfig.domainName; 
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hostname.includes(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');
    const path = url.pathname; 
    const action = url.searchParams.get('action');
    const sub = url.searchParams.get('sub'); 

    // 1. DETEKSI VPN/PROXY DENGAN BLACKBOX (Tetap ada)
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    if (clientIp) {
      try {
        const ipCheck = await fetch(`https://blackbox.ipinfo.app/lookup/${clientIp}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store'
        });
        const isVpn = await ipCheck.text();
        if (isVpn.trim() === 'Y') {
          const vpnResponse = NextResponse.redirect(`https://${mainDomain}/vpn`, 307);
          vpnResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          return vpnResponse;
        }
      } catch (e) { console.error("Gagal cek Blackbox:", e); }
    }

    try {
      // 2. AMBIL DATA DARI SUPABASE
      let queryUrl = `${supabaseUrl}/rest/v1/redirects?select=*&subdomain=eq.${subdomain}`;
      if (action === 'register' && sub) {
        queryUrl += `&tipe=eq.offer`;
      } else if (path.length > 1) {
        const cleanPath = path.substring(1); 
        queryUrl += `&path=eq.${cleanPath}&tipe=eq.smartlink`;
      } else {
        url.pathname = '/404'; return NextResponse.rewrite(url);
      }

      const response = await fetch(queryUrl, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        cache: 'no-store'
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const redirectData = data[0];

        // 3. SISTEM FILTER NEGARA (GEO-BLOCKING)
        // Vercel otomatis memberikan 2 huruf kode negara pengunjung (contoh: 'ID', 'US')
        const visitorCountry = req.headers.get('x-vercel-ip-country') || 'UNKNOWN';
        const rule = redirectData.geo_rule || 'all';
        
        // Buat array dari input custom (bersihkan spasi)
        const customCountries = redirectData.geo_custom 
          ? redirectData.geo_custom.split(',').map(c => c.trim().toUpperCase()) 
          : [];

        let isAllowed = true;

        if (visitorCountry !== 'UNKNOWN') {
          switch (rule) {
            case 'tier1':
              isAllowed = TIER_1.includes(visitorCountry);
              break;
            case 'tier2':
              isAllowed = TIER_2.includes(visitorCountry);
              break;
            case 'tier3':
              isAllowed = TIER_3.includes(visitorCountry);
              break;
            case 'custom_allow':
              isAllowed = customCountries.includes(visitorCountry);
              break;
            case 'custom_block':
              isAllowed = !customCountries.includes(visitorCountry);
              break;
            case 'all':
            default:
              isAllowed = true;
          }
        }

        // Jika negara tidak diizinkan, tendang secara diam-diam ke 404
        if (!isAllowed) {
          url.pathname = '/404';
          const blockResponse = NextResponse.rewrite(url);
          blockResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          return blockResponse;
        }

        // 4. JIKA LOLOS, TAMBAH HIT COUNT & REDIRECT
        fetch(`${supabaseUrl}/rest/v1/redirects?id=eq.${redirectData.id}`, {
          method: 'PATCH',
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ hit_count: redirectData.hit_count + 1 })
        }).catch(err => console.error("Gagal update hit"));

        let targetResponse;
        if (action === 'register' && sub && redirectData.tipe === 'offer') {
           targetResponse = NextResponse.redirect(redirectData.target_url + sub, 307);
        } else if (redirectData.tipe === 'smartlink') {
           targetResponse = NextResponse.redirect(redirectData.target_url, 307);
        }

        if (targetResponse) {
          targetResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          return targetResponse;
        }
      }

      url.pathname = '/404'; return NextResponse.rewrite(url);

    } catch (error) {
      console.error("Middleware Error:", error);
      url.pathname = '/404'; return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
