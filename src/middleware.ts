import { NextRequest, NextResponse } from 'next/server';
import { randomBytes as generateRandomBytes } from 'crypto';

export function middleware(request: NextRequest) {
  // Generar request ID único para tracking
  const requestId = generateRandomBytes(16).toString('hex');

  // Agregar headers de seguridad
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
