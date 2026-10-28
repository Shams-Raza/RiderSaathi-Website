import { NextResponse } from 'next/server';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 302);
  response.cookies.delete('admin_session');
  return response;
}

export async function POST(request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.cookies.delete('admin_session');
  return response;
}
