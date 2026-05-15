import { describe, it, expect } from 'vitest';
import { errorResponse, successResponse } from './responses';

describe('API Responses', () => {
  it('should format error response correctly', () => {
    const res = errorResponse('Something went wrong', 'ERR_BAD_REQUEST', { field: 'name' });
    expect(res).toEqual({
      error: 'Something went wrong',
      code: 'ERR_BAD_REQUEST',
      details: { field: 'name' },
    });
  });

  it('should format success response correctly', () => {
    const res = successResponse({ id: 1 }, { total: 100 });
    expect(res).toEqual({
      success: true,
      data: { id: 1 },
      meta: { total: 100 },
    });
  });
});
