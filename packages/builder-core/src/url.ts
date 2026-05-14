const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_ASSET_PROTOCOLS = new Set(['http:', 'https:']);

function startsWithSafeRelativePrefix(value: string) {
  return value.startsWith('/') || value.startsWith('./') || value.startsWith('../') || value.startsWith('#');
}

function parseUrl(value: string) {
  try {
    return new URL(value, 'https://example.com');
  } catch {
    return null;
  }
}

export function isSafeHref(value: string) {
  if (!value.trim()) {
    return false;
  }

  if (startsWithSafeRelativePrefix(value)) {
    return true;
  }

  const url = parseUrl(value);

  if (!url) {
    return false;
  }

  return SAFE_LINK_PROTOCOLS.has(url.protocol);
}

export function isSafeAssetSrc(value: string) {
  if (!value.trim()) {
    return false;
  }

  if (value.startsWith('/')) {
    return true;
  }

  const url = parseUrl(value);

  if (!url) {
    return false;
  }

  return SAFE_ASSET_PROTOCOLS.has(url.protocol);
}
