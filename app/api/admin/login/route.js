import { NextResponse } from 'next/server';
import {
  initAdminCredentials,
  signSession,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
  bcrypt,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_OPTIONS,
} from '@/lib/auth';
import { getAdmin } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let email = '';
    let password = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await request.json();
      email = json.email;
      password = json.password;
    } else {
      const formData = await request.formData();
      email = formData.get('email');
      password = formData.get('password');
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkLoginRateLimit(clientIp);

    if (!limit.allowed) {
      if (contentType.includes('application/json')) {
        return NextResponse.json({ ok: false, error: limit.message }, { status: 429 });
      }
      return NextResponse.redirect(
        new URL(
          `/admin/login?error=${encodeURIComponent(limit.message)}&email=${encodeURIComponent(email || '')}`,
          request.url
        ),
        303
      );
    }

    const admin = getAdmin() || initAdminCredentials();
    const inputEmail = String(email || '').trim().toLowerCase();
    const adminEmail = String(admin.email || '').trim().toLowerCase();

    const isEmailMatch = inputEmail === adminEmail;
    const isPasswordMatch =
      admin.passwordHash && bcrypt.compareSync(String(password || ''), admin.passwordHash);

    if (isEmailMatch && isPasswordMatch) {
      resetLoginRateLimit(clientIp);
      const token = signSession(admin.email);

      const response = contentType.includes('application/json')
        ? NextResponse.json({ ok: true, redirectUrl: '/admin' })
        : NextResponse.redirect(new URL('/admin', request.url), 303);

      response.cookies.set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);
      return response;
    }

    recordLoginFailure(clientIp);
    const errorMsg = 'Invalid email address or password. Please try again.';

    if (contentType.includes('application/json')) {
      return NextResponse.json({ ok: false, error: errorMsg }, { status: 401 });
    }

    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${encodeURIComponent(errorMsg)}&email=${encodeURIComponent(email || '')}`,
        request.url
      ),
      303
    );
  } catch (err) {
    console.error('Error in admin login POST:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error processing admin login.' },
      { status: 500 }
    );
  }
}
