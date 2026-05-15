import { describe, expect, it } from 'vitest';
import {
  buildMemberLoginPath,
  getMemberCookieName,
  parseLoginInput,
  parseProfileInput,
  parseSignupInput,
} from '@/lib/members/service';
import { isResolvedSiteMatch } from '@/lib/sites/service';

describe('member service validation', () => {
  it('normalizes signup email addresses and rejects weak passwords', () => {
    const parsed = parseSignupInput({
      confirmPassword: 'StrongPassword!2',
      email: '  MEMBER@Example.COM  ',
      firstName: 'Member',
      password: 'StrongPassword!2',
    });

    expect(parsed.email).toBe('member@example.com');

    expect(() =>
      parseSignupInput({
        confirmPassword: 'weak',
        email: 'member@example.com',
        firstName: 'Member',
        password: 'weak',
      }),
    ).toThrow(/at least 12 characters/i);
  });

  it('does not allow arbitrary role input during signup parsing', () => {
    const parsed = parseSignupInput({
      confirmPassword: 'StrongPassword!2',
      email: 'member@example.com',
      firstName: 'Member',
      password: 'StrongPassword!2',
      role: 'super-admin',
    });

    expect(parsed).not.toHaveProperty('role');
  });

  it('requires email and password on login', () => {
    expect(() => parseLoginInput({ email: '', password: '' })).toThrow(/required/i);
  });

  it('validates profile updates and keeps safe local redirect targets only', () => {
    expect(parseProfileInput({ firstName: 'Mina', lastName: 'Said' })).toEqual({
      firstName: 'Mina',
      lastName: 'Said',
    });
    expect(buildMemberLoginPath('/account')).toBe('/login?next=%2Faccount');
    expect(buildMemberLoginPath('https://evil.example')).toBe('/login');
    expect(getMemberCookieName()).toBe('nexpress-member-token');
  });

  it('treats missing or mismatched site assignments as cross-site access', () => {
    const site = {
      id: 'site-1',
      isDefault: false,
      name: 'Site One',
      primaryHostname: 'site-one.example.com',
      siteId: 'site-one',
      slug: 'site-one',
    } as const;

    expect(isResolvedSiteMatch(site, 'site-1')).toBe(true);
    expect(isResolvedSiteMatch(site, 'site-2')).toBe(false);
    expect(isResolvedSiteMatch(site, null)).toBe(false);
  });
});
