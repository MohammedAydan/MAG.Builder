export class CommerceServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'commerce-disabled'
      | 'commerce-misconfigured'
      | 'invalid-input'
      | 'not-authenticated'
      | 'not-found'
      | 'upstream-error',
    readonly status: number,
  ) {
    super(message);
  }
}

import { CommerceConfigError, CommerceRequestError } from '@nexpress/commerce';

export function normalizeCommerceError(error: unknown) {
  if (error instanceof CommerceServiceError) {
    return error;
  }

  if (error instanceof CommerceConfigError) {
    return new CommerceServiceError(error.message, 'commerce-misconfigured', 503);
  }

  if (error instanceof CommerceRequestError) {
    return new CommerceServiceError(
      'Commerce provider request failed.',
      'upstream-error',
      error.status ?? 502,
    );
  }

  if (error instanceof Error) {
    return new CommerceServiceError(error.message, 'upstream-error', 500);
  }

  return new CommerceServiceError('Commerce request failed.', 'upstream-error', 500);
}

export function getSafeCommerceErrorMessage(error: unknown) {
  return normalizeCommerceError(error).message;
}
