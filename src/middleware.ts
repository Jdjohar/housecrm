import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'housecrm_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'housecrm-secure-admin-secret-key-2026';

/**
 * Verify session token inside Next.js Edge Middleware
 */
async function isValidSession(token: string): Promise<boolean> {
  try {
    if (!token || !token.includes('.')) return false;
    const [payloadBase64, signatureBase64] = token.split('.');
    if (!payloadBase64 || !signatureBase64) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert base64url to Uint8Array
    const binaryStr = atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      signatureBytes[i] = binaryStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return false;

    // Check expiration
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Always allow public customer routes and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/seed') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/review') ||
    pathname.startsWith('/feedback') ||
    pathname.includes('.') // static files like favicon.ico, images, icons
  ) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuth = sessionToken ? await isValidSession(sessionToken) : false;

  // 2. If user is at /login
  if (pathname === '/login') {
    if (isAuth) {
      // Already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // 3. If accessing any protected route without valid session, redirect to /login
  if (!isAuth) {
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
