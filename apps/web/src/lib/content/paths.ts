export function normalizeContentPath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '/';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const withoutDomain = trimmed.replace(/^\/+/, '');
  const path = `/${withoutDomain}`;

  return path === '//' ? '/' : path.replace(/\/{2,}/g, '/');
}

export function isSafeRedirectDestination(value: string) {
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  return value.startsWith('/');
}
