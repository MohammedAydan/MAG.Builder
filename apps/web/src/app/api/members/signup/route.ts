import { NextResponse } from 'next/server';
import { getSafeMemberErrorMessage, loginMember, registerMember } from '@/lib/members/service';

function redirectWithMessage(request: Request, path: string, message?: string) {
  const url = new URL(path, request.url);

  if (message) {
    url.searchParams.set('error', message);
  }

  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const next = formData.get('next');
  const nextPath = typeof next === 'string' ? next : '/account';

  try {
    const input = Object.fromEntries(formData.entries());
    await registerMember(input);
    await loginMember(input);

    return NextResponse.redirect(new URL(nextPath, request.url), 303);
  } catch (error) {
    return redirectWithMessage(request, '/signup', getSafeMemberErrorMessage(error));
  }
}
