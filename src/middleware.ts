import { NextResponse, type NextRequest } from 'next/server';

// Marca cada navegador com um id estável (fingerprint simples do PRD §7.2).
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get('ca_dev')) {
    res.cookies.set('ca_dev', crypto.randomUUID(), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

export const config = { matcher: ['/((?!_next|api|favicon|.*\..*).*)'] };
