import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const COOKIE_NAME = 'dhaagae_token';

// ─── Protected route definitions ─────────────────────────────────────────────

/** Routes that require any authenticated user */
const AUTH_REQUIRED_ROUTES = [
  '/account',
  '/checkout',
  '/wishlist',
  '/api/auth/me',
];

/** Routes that require ADMIN role — checked with startsWith */
const ADMIN_REQUIRED_ROUTES = [
  '/admin',
  '/api/admin',
];

/** Routes that are for guests only (redirect logged-in users away) */
const GUEST_ONLY_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value ?? null;
  const session = token ? verifyToken(token) : null;

  // 1. Admin routes — require ADMIN role
  if (ADMIN_REQUIRED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'ADMIN') {
      // Redirect non-admins to home with an unauthorized signal
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }
  }

  // 2. Auth-required routes — any logged-in user
  if (AUTH_REQUIRED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Guest-only routes — redirect authenticated users
  if (GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (session) {
      const redirect = request.nextUrl.searchParams.get('redirect') || '/account';
      return NextResponse.redirect(new URL(redirect, request.url));
    }
  }

  // Pass through — attach user role header for downstream use
  const response = NextResponse.next();
  if (session) {
    response.headers.set('x-user-id', session.userId);
    response.headers.set('x-user-role', session.role);
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)).*)',
  ],
};
