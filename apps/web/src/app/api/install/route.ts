import { assertSameOriginInstallRequest } from '@/lib/install/security';
import { InstallFlowError, installSystem, parseInstallInput } from '@/lib/install/service';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function redirectWithMessage(request: Request, path: string, message?: string) {
  const url = new URL(path, request.url);

  if (message) {
    url.searchParams.set('error', message);
  }

  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  try {
    assertSameOriginInstallRequest(request);

    const formData = await request.formData();
    const input = parseInstallInput(formData);

    await installSystem(input);

    return NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
  } catch (error) {
    if (error instanceof InstallFlowError) {
      if (error.code === 'already-installed') {
        return redirectWithMessage(request, '/', 'This site is already installed.');
      }

      return redirectWithMessage(request, '/install', error.message);
    }

    if (error instanceof Error) {
      return redirectWithMessage(request, '/install', error.message);
    }

    return redirectWithMessage(request, '/install', 'Installation failed. Please try again.');
  }
}
