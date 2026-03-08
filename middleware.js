import { NextResponse } from 'next/server';
import { siteConfig } from './config';

// DAFTAR NEGARA SUPER LENGKAP
// Tier 1 (Premium / Bayaran Tertinggi)
const TIER_1 = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'NO', 'SE', 'DK', 'FI', 'CH', 'NL', 'DE'];
// Tier 2 (Menengah / Kompetisi Sedang)
const TIER_2 = ['FR', 'IT', 'ES', 'JP', 'SG', 'KR', 'AE', 'QA', 'IL', 'PL', 'CZ', 'PT', 'GR', 'ZA', 'AT', 'BE', 'HK', 'TW', 'SA', 'MY', 'CL', 'UY', 'HR', 'HU', 'SK'];
// Tier 3 (Volume Besar / Bayaran Receh)
const TIER_3 = ['ID', 'IN', 'BR', 'PH', 'NG', 'VN', 'TH', 'MX', 'AR', 'CO', 'EG', 'PK', 'BD', 'TR', 'PE', 'VE', 'DZ', 'MA', 'KE', 'LK', 'KH', 'MM', 'NP', 'BO', 'PY', 'EC'];

// DAFTAR HITAM BOT & SPY TOOL
const BOT_AGENTS = [
  'bot', 'crawler', 'spider', 'facebookexternalhit', 'whatsapp', 
  'telegrambot', 'twitterbot', 'googlebot', 'bingbot', 'slurp', 
  'duckduckbot', 'yandexbot', 'adplexity', 'ahrefsbot', 'semrushbot',
  'mj12bot', 'megaindex', 'dataprovider', 'builtwith', 'spyonweb', 'headless'
];

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
    // 0. SISTEM ANTI-BOT & ANTI-SPY TOOL
    // ==========================================
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const isBot = BOT_AGENTS.some(keyword => userAgent.includes(keyword));

    if (isBot) {
      url.pathname = '/404';
      const botResponse = NextResponse.rewrite(url);
      botResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return botResponse;
    }

    // ==========================================
    // 1. DETEKSI VPN/PROXY DENGAN BLACKBOX
    // ==========================================
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    if (clientIp) {
      try {
        const ipCheck = await fetch(`https://blackbox.ipinfo.app/lookup/${clientIp}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, cache: 'no-store'
        });
        const isVpn = await ipCheck.text();
        if (isVpn.trim() === 'Y') {
          const vpnResponse = NextResponse.redirect(`https://${mainDomain}/vpn`, 307);
          vpnResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          return vpnResponse;
        }
      } catch (e) { console.error("Gagal cek Blackbox:", e); }
    }

    // ==========================================
    // 2. AMBIL DATA DARI SUPABASE & FILTER NEGARA
    // ==========================================
    try {
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

        const visitorCountry = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'UNKNOWN';
        const rule = redirectData.geo_rule || 'all';
        const customCountries = redirectData.geo_custom ? redirectData.geo_custom.split(',').map(c => c.trim().toUpperCase()) : [];

        let isAllowed = true;

        if (visitorCountry !== 'UNKNOWN') {
          if (rule === 'all') {
            isAllowed = true;
          } else if (rule === 'custom_allow') {
            isAllowed = customCountries.includes(visitorCountry);
          } else if (rule === 'custom_block') {
            isAllowed = !customCountries.includes(visitorCountry);
          } else {
            // Logika baru: Menggabungkan array Tier sesuai aturan yang dipilih
            let allowedTiers = [];
            if (rule.includes('tier1')) allowedTiers = [...allowedTiers, ...TIER_1];
            if (rule.includes('tier2')) allowedTiers = [...allowedTiers, ...TIER_2];
            if (rule.includes('tier3')) allowedTiers = [...allowedTiers, ...TIER_3];

            if (allowedTiers.length > 0) {
              isAllowed = allowedTiers.includes(visitorCountry);
            } else {
              isAllowed = true; // Jaga-jaga jika rule kosong
            }
          }
        }

        if (!isAllowed) {
          url.pathname = '/404';
          const blockResponse = NextResponse.rewrite(url);
          blockResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          return blockResponse;
        }

        // --- JIKA LOLOS SEMUA FILTER: TAMBAH HIT COUNT & REDIRECT ---
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
