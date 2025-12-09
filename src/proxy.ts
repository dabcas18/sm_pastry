import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Check environment - dev allows any non-production domain
  const isAdminSubdomain = hostname.startsWith('admin.') && hostname.includes('sistersandmom.site');
  const isProduction = hostname.includes('sistersandmom.site');
  const isDev = !isProduction; // Any non-production domain (localhost, IP addresses, etc.)

  // On admin subdomain in production, redirect root to login or orders
  if (isAdminSubdomain && pathname === '/') {
    if (adminSession) {
      return NextResponse.redirect(new URL('/orders', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected admin routes
  const protectedRoutes = ['/orders', '/sales', '/production', '/products'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Login page access control
  const canAccessAdmin = isAdminSubdomain || isDev;

  if (pathname === '/login' && !canAccessAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protected route access control
  if (isProtectedRoute && !adminSession) {
    if (canAccessAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && adminSession) {
    return NextResponse.redirect(new URL('/orders', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.jpg|menu.png|sw.js|manifest.json|icon-.*\\.png|gcash-qr.jpg|maribank-qr.jpg).*)',
  ],
};
