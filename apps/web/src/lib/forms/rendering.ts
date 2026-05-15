import { getPublicFormDefinition } from './service';
import type { ResolvedSite } from '@/lib/sites/service';
import type { PublicFormDefinition } from '@nexpress/forms';

/**
 * Fetch a safe public form definition by slug for the current site.
 */
export async function fetchPublicForm(
  slug: string,
  site: ResolvedSite,
): Promise<PublicFormDefinition | null> {
  return getPublicFormDefinition(slug, site);
}
