'use server';

import { reindexAllContent } from '@/lib/search/service';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { revalidatePath } from 'next/cache';

export async function triggerReindex() {
  await requireDashboardUser();
  
  try {
    await reindexAllContent();
    revalidatePath('/dashboard/search');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
