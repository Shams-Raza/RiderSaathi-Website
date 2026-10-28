import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 302);
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
  });
  return response;
}

export async function POST(request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
  });
  return response;
}
