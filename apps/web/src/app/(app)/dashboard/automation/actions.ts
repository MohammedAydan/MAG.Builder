'use server';

import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { revalidatePath } from 'next/cache';

export async function toggleRule(ruleId: string, enabled: boolean) {
  await requireDashboardUser();
  
  const cms = await getPayload({ config: configPromise });
  
  try {
    await cms.update({
      collection: 'automation-rules',
      id: ruleId,
      data: { enabled },
      overrideAccess: true,
    });
    
    revalidatePath('/dashboard/automation');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
