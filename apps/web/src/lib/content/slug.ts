const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlugSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function isSafeSlugSegment(value: string) {
  return slugPattern.test(value);
}

export function assertSafeSlugSegment(value: string) {
  if (!isSafeSlugSegment(value)) {
    throw new Error('Slug must contain lowercase letters, numbers, and single hyphen separators only.');
  }

  return value;
}
