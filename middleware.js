import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin' || (pathname.startsWith('/admin/') && pathname !== '/admin/login' && pathname !== '/admin/logout')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
