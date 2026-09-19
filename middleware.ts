import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Admin route detection: /admin and all sub-paths live directly on the main domain (domain.com/admin)
  const isAdmin = url.pathname.startsWith('/admin');

  // Set custom header so Root Layout knows to hide the public Navbar and Footer on admin pages
  const requestHeaders = new Headers(req.headers);
  if (isAdmin) {
    requestHeaders.set('x-is-admin', 'true');
  }

  // Bypass Next.js internal files and API routes
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: [
    '/((?!favicon.ico|.*\\.).*)',
  ],
};

