import { NextResponse } from 'next/server';
import { getSafeMemberErrorCode, MemberAuthError, updateAuthenticatedMemberProfile } from '@/lib/members/service';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

export async function POST(request: Request) {
  try {
    const browserPostError = validateBrowserPostRequest(request, {
      message: 'Cross-site member profile updates are blocked.',
    });

    if (browserPostError) {
      throw new MemberAuthError(browserPostError, 'csrf', 403);
    }

    const formData = await request.formData();
    await updateAuthenticatedMemberProfile(Object.fromEntries(formData.entries()));

    const url = new URL('/account', request.url);
    url.searchParams.set('success', 'profile_updated');

    return NextResponse.redirect(url, 303);
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 400;
    const url = new URL(status === 401 ? '/login' : '/account', request.url);
    url.searchParams.set('error', getSafeMemberErrorCode(error, 'profile'));

    return NextResponse.redirect(url, 303);
  }
}
