import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    // Mengambil data dari settingan Vercel
    const validUser = process.env.PANEL_USER;
    const validPass = process.env.PANEL_PASS;

    if (username === validUser && password === validPass) {
      // Jika benar, berikan tiket (Cookie) yang berlaku 7 hari
      cookies().set('admin_auth', 'akses_diizinkan_100', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 hari
        path: '/',
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid username or password.' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error encountered.' }, { status: 500 });
  }
}
