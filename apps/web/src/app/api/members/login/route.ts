import { NextResponse } from 'next/server';
import { getSafeMemberErrorMessage, loginMember } from '@/lib/members/service';

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
    await loginMember(Object.fromEntries(formData.entries()));

    return NextResponse.redirect(new URL(nextPath, request.url), 303);
  } catch (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', getSafeMemberErrorMessage(error));

    if (nextPath !== '/account') {
      url.searchParams.set('next', nextPath);
    }

    return NextResponse.redirect(url, 303);
  }
}
