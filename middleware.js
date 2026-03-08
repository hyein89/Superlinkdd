import { NextResponse } from 'next/server';
import { siteConfig } from './config';

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

    // ==========================================
    // SISTEM KEAMANAN: DETEKSI VPN & PROXY
    // ==========================================
     const clientIp = req.ip || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    if (clientIp) {
      try {
        // Tambahan { cache: 'no-store' } agar hasil cek IP tidak diingat oleh Vercel
        const ipCheck = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,proxy,hosting`, {
          cache: 'no-store'
        });
        const ipData = await ipCheck.json();

        if (ipData.status === 'success' && (ipData.proxy || ipData.hosting)) {
          // Jika ketahuan VPN, lempar ke halaman peringatan DENGAN anti-cache
          const vpnResponse = NextResponse.redirect(`https://${mainDomain}/vpn`, 307);
          vpnResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          return vpnResponse;
        }
      } catch (e) {
        console.error("Gagal cek IP VPN", e);
      }
    }
    // ==========================================

    try {
      let queryUrl = `${supabaseUrl}/rest/v1/redirects?select=*&subdomain=eq.${subdomain}`;
      
      if (action === 'register' && sub) {
        queryUrl += `&tipe=eq.offer`;
      } else if (path.length > 1) {
        const cleanPath = path.substring(1); 
        queryUrl += `&path=eq.${cleanPath}&tipe=eq.smartlink`;
      } else {
        url.pathname = '/404';
        return NextResponse.rewrite(url);
      }

      // Tarik data dari Supabase tanpa cache
      const response = await fetch(queryUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (data && data.length > 0) {
        const redirectData = data[0];
        
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

        // Skenario Offer
        if (action === 'register' && sub && redirectData.tipe === 'offer') {
           const finalOfferUrl = redirectData.target_url + sub;
           targetResponse = NextResponse.redirect(finalOfferUrl, 307);
        } 
        // Skenario Smartlink
        else if (redirectData.tipe === 'smartlink') {
           // Pakai 307 (Temporary Redirect) alih-alih 301 agar browser tidak menge-cache selamanya
           targetResponse = NextResponse.redirect(redirectData.target_url, 307);
        }

        if (targetResponse) {
          // Terapkan header anti-cache super ketat di sini
          targetResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          return targetResponse;
        }
      }

      url.pathname = '/404';
      return NextResponse.rewrite(url);

    } catch (error) {
      console.error("Middleware Error:", error);
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
