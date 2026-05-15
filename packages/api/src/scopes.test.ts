import { describe, it, expect } from 'vitest';
import { hasScope, ApiScopes } from './scopes';

describe('API Scopes', () => {
  it('should return true if scope is present', () => {
    expect(hasScope(ApiScopes.PUBLIC_READ, [ApiScopes.PUBLIC_READ])).toBe(true);
  });

  it('should return false if scope is missing', () => {
    expect(hasScope(ApiScopes.MEMBER_WRITE, [ApiScopes.MEMBER_READ])).toBe(false);
  });

  it('should return true for any scope if SYSTEM scope is present', () => {
    expect(hasScope(ApiScopes.ADMIN_WRITE, [ApiScopes.SYSTEM])).toBe(true);
    expect(hasScope(ApiScopes.MEMBER_READ, [ApiScopes.SYSTEM])).toBe(true);
  });
});
