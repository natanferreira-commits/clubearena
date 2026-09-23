import { NextResponse } from 'next/server';
import { deslogarMembro } from '@/lib/session';

export async function GET(req: Request) {
  await deslogarMembro();
  return NextResponse.redirect(new URL('/', req.url));
}
