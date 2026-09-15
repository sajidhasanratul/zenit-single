import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const host = hostname.toLowerCase().split(':')[0];
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 1. Backward compatibility: Redirect any legacy admin subdomain requests to single-domain /admin
  if (host.startsWith('admin.')) {
    const protocol = isDevelopment ? 'http' : 'https';
    const cleanHost = hostname.replace(/^admin\./i, '');
    const targetPath = url.pathname.startsWith('/admin') ? url.pathname : `/admin${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.redirect(new URL(`${protocol}://${cleanHost}${targetPath}${url.search}`));
  }

  // 2. Admin route detection
  const isAdmin = url.pathname.startsWith('/admin');

  // Set custom headers to propagate admin status to Layout Components (hides public navbar/footer)
  const requestHeaders = new Headers(req.headers);
  if (isAdmin) {
    requestHeaders.set('x-is-admin', 'true');
  }

  // 3. Bypass Next.js internals and API paths
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

