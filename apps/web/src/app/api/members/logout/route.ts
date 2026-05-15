import { NextResponse } from 'next/server';
import { logoutMember } from '@/lib/members/service';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

export async function POST(request: Request) {
  const browserPostError = validateBrowserPostRequest(request, {
    message: 'Cross-site member logout requests are blocked.',
  });

  if (browserPostError) {
    const url = new URL('/account', request.url);
    url.searchParams.set('error', 'csrf');
    return NextResponse.redirect(url, 303);
  }

  await logoutMember();

  return NextResponse.redirect(new URL('/', request.url), 303);
}
