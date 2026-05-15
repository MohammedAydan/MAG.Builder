export type BrowserPostValidationOptions = Readonly<{
  message?: string;
  requireOriginOrReferer?: boolean;
}>;

function getRequestOrigin(request: Request) {
  return new URL(request.url).origin;
}

function getHeaderOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getSameOriginBrowserPostError(
  request: Request,
  options: BrowserPostValidationOptions = {},
) {
  const {
    message = 'Cross-site form submissions are blocked.',
    requireOriginOrReferer = true,
  } = options;
  const requestOrigin = getRequestOrigin(request);
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin && origin !== requestOrigin) {
    return message;
  }

  const refererOrigin = getHeaderOrigin(referer);

  if (!origin && referer && refererOrigin !== requestOrigin) {
    return message;
  }

  if (!origin && !refererOrigin && requireOriginOrReferer) {
    return message;
  }

  return null;
}

export function isSameOriginBrowserPost(request: Request) {
  return getSameOriginBrowserPostError(request) === null;
}

export function assertSameOriginBrowserPost(
  request: Request,
  options: BrowserPostValidationOptions = {},
): void {
  const message = getSameOriginBrowserPostError(request, options);

  if (message) {
    throw new Error(message);
  }
}

export function validateBrowserPostRequest(
  request: Request,
  options: BrowserPostValidationOptions = {},
) {
  return getSameOriginBrowserPostError(request, options);
}
