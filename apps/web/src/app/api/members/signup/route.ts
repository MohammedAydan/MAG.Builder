import { NextResponse } from 'next/server';
import { getSafeMemberErrorCode, loginMember, MemberAuthError, registerMember } from '@/lib/members/service';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

function redirectWithMessage(request: Request, path: string, message?: string) {
  const url = new URL(path, request.url);

  if (message) {
    url.searchParams.set('error', message);
  }

  return NextResponse.redirect(url, 303);
}

function getSafeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/account';
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const browserPostError = validateBrowserPostRequest(request, {
      message: 'Cross-site member sign-up requests are blocked.',
    });

    if (browserPostError) {
      throw new MemberAuthError(browserPostError, 'csrf', 403);
    }

    const formData = await request.formData();
    const next = getSafeReturnPath(formData.get('next'));
    const nextPath = typeof next === 'string' ? next : '/account';
    const input = Object.fromEntries(formData.entries());
    await registerMember(input);
    await loginMember(input);

    return NextResponse.redirect(new URL(nextPath, request.url), 303);
  } catch (error) {
    return redirectWithMessage(request, '/signup', getSafeMemberErrorCode(error, 'signup'));
  }
}
