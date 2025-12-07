import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Check if accessing from admin subdomain (not localhost - keep landing page accessible for dev)
  const isAdminSubdomain = hostname.startsWith('admin.');

  // On admin subdomain, redirect root to login or orders
  if (isAdminSubdomain && pathname === '/') {
    if (adminSession) {
      return NextResponse.redirect(new URL('/orders', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/orders', '/sales', '/production'];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Block /login access unless on admin subdomain or localhost (for dev)
  const allowLogin = isAdminSubdomain || hostname.includes('localhost');
  if (pathname === '/login' && !allowLogin && !adminSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected route without session, redirect to login or home
  if (isProtectedRoute && !adminSession) {
    if (allowLogin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If logged in and trying to access login page, redirect to orders
  if (pathname === '/login' && adminSession) {
    return NextResponse.redirect(new URL('/orders', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.jpg (logo file)
     * - products (product images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.jpg|menu.png|products).*)',
  ],
};
