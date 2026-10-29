import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Admin route protection
  if (pathname === '/admin' || (pathname.startsWith('/admin/') && pathname !== '/admin/login' && pathname !== '/admin/logout')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Language resolution: Priority 1) ?lang= query param, 2) lang cookie, 3) default 'hi'
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images, css, favicon.ico, manifest (public files)
     */
    '/((?!api|_next/static|_next/image|images|css|favicon.ico|manifest).*)',
  ],
};
