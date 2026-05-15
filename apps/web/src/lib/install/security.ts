import { InstallFlowError } from '@/lib/install/service';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

export function assertSameOriginInstallRequest(request: Request) {
  const errorMessage = validateBrowserPostRequest(request, {
    message: 'Cross-site install attempts are blocked.',
  });

  if (errorMessage) {
    throw new InstallFlowError(errorMessage, 'csrf', 403);
  }
}
