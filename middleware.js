import { NextResponse } from 'next/server';

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Ganti dengan domain utama kamu nanti
  const mainDomain = 'tes.eu.org'; 

  // Cek apakah ini akses subdomain (misal: stringacak.tes.eu.org)
  if (hostname.includes(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');
    const path = url.pathname; // misal: /numberrondom
    
    // Ambil query parameter
    const action = url.searchParams.get('action');
    const sub = url.searchParams.get('sub'); // misal: tees

    // --- LOGIKA REDIRECT ---
    
    // Skenario B: URL Offer (ada action=register & sub)
    if (action === 'register' && sub) {
      // Di tahap selanjutnya, kita bisa fetch target asli dari Supabase di sini
      // Simulasi hasil dari DB:
      const targetOfferUrl = 'https://offer.com/'; 
      
      // Redirect ke offer.com/?id=tees
      return NextResponse.redirect(`${targetOfferUrl}?id=${sub}`, 302);
    }

    // Skenario A: URL Smartlink (ada path /numberrondom)
    if (path.length > 1) {
      // Di tahap selanjutnya, fetch ke Supabase: cek 'subdomain' & 'path'
      // Jika ketemu, redirect ke middle link.
      // Jika TIDAK KETEMU, lempar ke 404:
      const linkDitemukan = false; // Ubah ke logika DB nanti
      
      if (!linkDitemukan) {
        url.pathname = '/404';
        return NextResponse.rewrite(url);
      }
    }

    // Jika subdomain ada tapi path kosong dan bukan offer, lempar ke 404
    url.pathname = '/404';
    return NextResponse.rewrite(url);
  }

  // Jika akses tes.eu.org biasa, biarkan lanjut ke halaman utama/buat
  return NextResponse.next();
}

// Konfigurasi path mana saja yang dicegat middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
