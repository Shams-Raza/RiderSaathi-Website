import { NextResponse } from 'next/server';
import {
  initAdminCredentials,
  signSession,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
  bcrypt,
} from '@/lib/auth';
import { getAdmin } from '@/lib/data';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkLoginRateLimit(clientIp);

    if (!limit.allowed) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent(limit.message)}&email=${encodeURIComponent(email || '')}`, request.url),
        303
      );
    }

    const admin = getAdmin() || initAdminCredentials();
    const inputEmail = String(email || '').trim().toLowerCase();
    const adminEmail = String(admin.email || '').trim().toLowerCase();

    const isEmailMatch = inputEmail === adminEmail;
    const isPasswordMatch = admin.passwordHash && bcrypt.compareSync(String(password || ''), admin.passwordHash);

    if (isEmailMatch && isPasswordMatch) {
      resetLoginRateLimit(clientIp);
      const token = signSession(admin.email);
      const response = NextResponse.redirect(new URL('/admin', request.url), 303);
      response.cookies.set('admin_session', token, {
        maxAge: 24 * 60 * 60,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    recordLoginFailure(clientIp);
    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${encodeURIComponent('Invalid email address or password. Please try again.')}&email=${encodeURIComponent(email || '')}`,
        request.url
      ),
      303
    );
  } catch (err) {
    console.error('Error in admin login POST:', err);
    return NextResponse.redirect(
      new URL('/admin/login?error=Server%20error.%20Please%20try%20again.', request.url),
      303
    );
  }
}
