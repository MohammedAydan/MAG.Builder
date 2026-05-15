import { NextResponse } from 'next/server';
import { getSafeMemberErrorMessage, updateAuthenticatedMemberProfile } from '@/lib/members/service';

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    await updateAuthenticatedMemberProfile(Object.fromEntries(formData.entries()));

    const url = new URL('/account', request.url);
    url.searchParams.set('success', 'Profile updated.');

    return NextResponse.redirect(url, 303);
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 400;
    const url = new URL(status === 401 ? '/login' : '/account', request.url);
    url.searchParams.set('error', getSafeMemberErrorMessage(error));

    return NextResponse.redirect(url, 303);
  }
}
