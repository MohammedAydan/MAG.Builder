import { describe, expect, it } from 'vitest';
import {
  assertSameOriginBrowserPost,
  isSameOriginBrowserPost,
  validateBrowserPostRequest,
} from '@/lib/security/browser-post';

describe('validateBrowserPostRequest', () => {
  it('allows same-origin requests with an Origin header', () => {
    const request = new Request('https://example.com/api/members/login', {
      headers: {
        origin: 'https://example.com',
      },
      method: 'POST',
    });

    expect(validateBrowserPostRequest(request)).toBeNull();
  });

  it('allows same-origin requests with only a Referer header', () => {
    const request = new Request('https://example.com/api/members/login', {
      headers: {
        referer: 'https://example.com/login?next=%2Faccount',
      },
      method: 'POST',
    });

    expect(validateBrowserPostRequest(request)).toBeNull();
  });

  it('rejects cross-site requests', () => {
    const request = new Request('https://example.com/api/members/login', {
      headers: {
        origin: 'https://attacker.example',
      },
      method: 'POST',
    });

    expect(validateBrowserPostRequest(request)).toBe(
      'Cross-site form submissions are blocked.',
    );
  });

  it('rejects requests without Origin or Referer headers by default', () => {
    const request = new Request('https://example.com/api/members/login', {
      method: 'POST',
    });

    expect(validateBrowserPostRequest(request)).toBe(
      'Cross-site form submissions are blocked.',
    );
  });

  it('rejects malformed Origin headers', () => {
    const request = new Request('https://example.com/api/members/login', {
      headers: {
        origin: 'not a url',
      },
      method: 'POST',
    });

    expect(validateBrowserPostRequest(request)).toBe(
      'Cross-site form submissions are blocked.',
    );
  });

  it('exposes a boolean helper for same-origin checks', () => {
    const request = new Request('https://example.com/api/members/login', {
      headers: {
        origin: 'https://example.com',
      },
      method: 'POST',
    });

    expect(isSameOriginBrowserPost(request)).toBe(true);
  });

  it('throws when asserting a cross-site browser POST', () => {
    const request = new Request('https://example.com/api/members/login', {
      headers: {
        origin: 'https://attacker.example',
      },
      method: 'POST',
    });

    expect(() => assertSameOriginBrowserPost(request)).toThrowError(
      'Cross-site form submissions are blocked.',
    );
  });
});
