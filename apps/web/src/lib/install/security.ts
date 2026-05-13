import { InstallFlowError } from '@/lib/install/service';

export function assertSameOriginInstallRequest(request: Request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const requestOrigin = new URL(request.url).origin;

  if (origin && origin !== requestOrigin) {
    throw new InstallFlowError('Cross-site install attempts are blocked.', 'csrf', 403);
  }

  if (!origin && referer) {
    const refererOrigin = new URL(referer).origin;
    if (refererOrigin !== requestOrigin) {
      throw new InstallFlowError('Cross-site install attempts are blocked.', 'csrf', 403);
    }
  }
}
