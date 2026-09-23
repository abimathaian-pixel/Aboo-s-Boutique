import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aboos-boutique-super-secret-jwt-key-2026-fashion'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('aboo_session')?.value;

  // 1. Handle Admin Portal Routes
  if (pathname.startsWith('/admin')) {
    // Exclude admin login page
    if (pathname === '/admin/login') {
      if (token) {
        try {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          if (payload.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
        } catch {
          // Token invalid, allow admin login
        }
      }
      return NextResponse.next();
    }

    // Protected admin routes: must have valid token with role === 'admin'
    if (!token) {
      return NextResponse.redirect(
        new URL('/admin/login?error=authentication_required', request.url)
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'admin') {
        // Customer trying to access admin portal
        return NextResponse.redirect(
          new URL('/admin/login?error=admin_privileges_required', request.url)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL('/admin/login?error=session_expired', request.url)
      );
    }
  }

  // 2. Handle Protected Customer Routes
  if (pathname.startsWith('/account')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
