import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Protect /api/admin/* endpoints (except /api/admin/login)
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    const authHeader = request.headers.get('authorization') || '';
    const xAdminToken = request.headers.get('x-admin-token') || '';
    const hasToken = !!(sessionCookie || authHeader || xAdminToken);

    if (!hasToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin authentication required.' },
        { status: 401 }
      );
    }
  }

  // 2. Protect /admin UI pages (except /admin/login and /admin/logout)
  if (pathname === '/admin' || (pathname.startsWith('/admin/') && pathname !== '/admin/login' && pathname !== '/admin/logout')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Language resolution: Priority 1) ?lang= query param, 2) lang cookie, 3) default 'hi'
  const allLangParams = searchParams.getAll('lang');
  const queryLang = allLangParams.length === 1 ? allLangParams[0] : null;
  const cookieLang = request.cookies.get('lang')?.value;
  const lang = (queryLang === 'en' || queryLang === 'hi')
    ? queryLang
    : (cookieLang === 'en' || cookieLang === 'hi' ? cookieLang : 'hi');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-lang', lang);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/((?!api|_next/static|_next/image|images|css|favicon.ico|manifest).*)',
  ],
};
