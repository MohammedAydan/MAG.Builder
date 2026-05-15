import { NextResponse } from 'next/server';
import { getSafeMemberErrorCode, loginMember, MemberAuthError } from '@/lib/members/service';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

function getSafeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/account';
  }

  return value;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const nextPath = getSafeReturnPath(formData.get('next'));

  try {
    const browserPostError = validateBrowserPostRequest(request, {
      message: 'Cross-site member login requests are blocked.',
    });

    if (browserPostError) {
      throw new MemberAuthError(browserPostError, 'csrf', 403);
    }

    await loginMember(Object.fromEntries(formData.entries()));

    return NextResponse.redirect(new URL(nextPath, request.url), 303);
  } catch (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', getSafeMemberErrorCode(error, 'login'));

    if (nextPath !== '/account') {
      url.searchParams.set('next', nextPath);
    }

    return NextResponse.redirect(url, 303);
  }
}
