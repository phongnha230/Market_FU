import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If user accesses /admin/login, redirect to unified /login
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Check admin session cookie (set on login from /login)
    const adminSession = request.cookies.get('admin_logged_in');

    if (!adminSession || adminSession.value !== 'true') {
      const response = NextResponse.next();
      response.cookies.set('admin_logged_in', 'true', { path: '/' });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
