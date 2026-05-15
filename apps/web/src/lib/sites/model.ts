import { z } from 'zod';

export const DEFAULT_SITE_ID = 'default';
export const DEFAULT_SITE_SLUG = 'default';

const RESERVED_SITE_SLUGS = new Set([
  'admin',
  'api',
  'dashboard',
  'install',
  'root',
  'system',
  'www',
]);

const BLOCKED_HOSTNAMES = new Set([
  '0.0.0.0',
  '169.254.169.254',
  'localhost',
  'metadata.google.internal',
]);

const IPV4_HOSTNAME = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const HOSTNAME_LABEL = /^[a-z0-9-]{1,63}$/;

export const hostnameSchema = z.string().trim().min(1).max(253);

export function normalizeSiteSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function isReservedSiteSlug(value: string) {
  return RESERVED_SITE_SLUGS.has(value) && value !== DEFAULT_SITE_SLUG;
}

export function isValidSiteSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !isReservedSiteSlug(value);
}

export function normalizeHostname(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

function isPrivateIpv4(hostname: string) {
  if (!IPV4_HOSTNAME.test(hostname)) {
    return false;
  }

  const [first = 0, second = 0] = hostname.split('.').map(Number);

  if (first === 10 || first === 127) {
    return true;
  }

  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  if (first === 192 && second === 168) {
    return true;
  }

  if (first === 169 && second === 254) {
    return true;
  }

  return false;
}

export function isDevelopmentHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
}

export function isValidHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);

  if (!normalized || normalized.length > 253) {
    return false;
  }

  if (normalized.includes('..')) {
    return false;
  }

  if (normalized.startsWith('-') || normalized.endsWith('-')) {
    return false;
  }

  if (IPV4_HOSTNAME.test(normalized)) {
    return normalized.split('.').every((segment) => {
      const value = Number(segment);
      return Number.isInteger(value) && value >= 0 && value <= 255;
    });
  }

  return normalized
    .split('.')
    .every((label) => HOSTNAME_LABEL.test(label) && !label.startsWith('-') && !label.endsWith('-'));
}

export function isBlockedProductionHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);
  return BLOCKED_HOSTNAMES.has(normalized) || isPrivateIpv4(normalized) || normalized === '::1';
}

export function validateDomainHostname(hostname: string, developmentOnly: boolean) {
  const normalized = normalizeHostname(hostname);

  if (!isValidHostname(normalized)) {
    return 'Hostname is invalid.';
  }

  if (!developmentOnly && (isDevelopmentHostname(normalized) || isBlockedProductionHostname(normalized))) {
    return 'Production hostnames cannot use localhost, private IPs, or metadata hosts.';
  }

  return true;
}

export function buildDefaultSiteName(siteName?: string | null) {
  const value = siteName?.trim();
  return value && value.length > 0 ? value.slice(0, 80) : 'Default Site';
}
