export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Creates a standard error payload.
 */
export function errorResponse(
  message: string,
  code?: string,
  details?: unknown,
): ApiErrorResponse {
  const payload: ApiErrorResponse = { error: message };
  if (code) payload.code = code;
  if (details) payload.details = details;

  return payload;
}

/**
 * Creates a standard success payload.
 */
export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta'],
): ApiSuccessResponse<T> {
  const payload: ApiSuccessResponse<T> = { success: true, data };
  if (meta) payload.meta = meta;

  return payload;
}
