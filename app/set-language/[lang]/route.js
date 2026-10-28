import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const lang = params.lang === 'en' ? 'en' : 'hi';
  const referer = request.headers.get('referer') || '/';

  let redirectTarget = '/';
  try {
    const parsed = new URL(referer, request.url);
    parsed.searchParams.delete('lang');
    redirectTarget = parsed.pathname + (parsed.search || '');
  } catch (e) {
    redirectTarget = referer;
  }

  const response = NextResponse.redirect(new URL(redirectTarget, request.url), 302);
  response.cookies.set('lang', lang, {
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
  });

  return response;
}
