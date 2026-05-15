import { NextResponse } from 'next/server';
import { logoutMember } from '@/lib/members/service';

export async function POST(request: Request) {
  await logoutMember();

  return NextResponse.redirect(new URL('/', request.url), 303);
}
