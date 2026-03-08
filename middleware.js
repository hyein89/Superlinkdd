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
    // Ambil IP asli pengunjung (Vercel Edge menggunakan x-forwarded-for)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    if (clientIp) {
      try {
        // Cek IP ke API gratis (fields=status,proxy,hosting)
        // proxy = mendeteksi VPN/Proxy/Tor
        // hosting = mendeteksi IP dari Datacenter (seperti bot/server)
        const ipCheck = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,proxy,hosting`);
        const ipData = await ipCheck.json();

        if (ipData.status === 'success' && (ipData.proxy || ipData.hosting)) {
          // Jika ketahuan pakai VPN/Proxy, langsung lempar ke halaman /vpn di domain utama
          return NextResponse.redirect(`https://${mainDomain}/vpn`, 302);
        }
      } catch (e) {
        console.error("Gagal cek IP VPN", e);
        // Jika API error, biarkan lolos agar pengunjung asli tidak terblokir
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

      const response = await fetch(queryUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
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

        // Skenario Offer: Tempel langsung parameter sub ke ujung URL target
        if (action === 'register' && sub && redirectData.tipe === 'offer') {
           const finalOfferUrl = redirectData.target_url + sub;
           return NextResponse.redirect(finalOfferUrl, 302);
        } 
        
        if (redirectData.tipe === 'smartlink') {
           return NextResponse.redirect(redirectData.target_url, 301);
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
