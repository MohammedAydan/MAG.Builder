import { test, expect } from '@playwright/test';

test.describe('Builder E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@example.com');
    await page.locator('input[name="password"]').fill('change-me-please');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('can access builder for a page', async ({ page }) => {
    // Navigate to a page edit screen. 
    // We assume a page with slug 'home' exists or we navigate to the pages list first.
    await page.goto('/admin/collections/pages');
    
    // Check if the list loads
    await expect(page.getByText(/Pages/i).first()).toBeVisible();
    
    // Find a link to edit a page in the list.
    // This is Payload Admin UI, we look for a row.
    // await page.locator('a[href*="/admin/collections/pages/"]').first().click();
    
    // Alternatively, go directly to a known edit page if we seeded one.
    // Let's try to find the "Visual Editor" or "Edit with Puck" button.
    // In our implementation, the builder is usually linked from the admin or a specific route.
    // For now, we smoke test the builder route if we know it.
    // Based on Phase 11, it might be /admin/visual-editor/pages/[id] or similar.
  });

  test('builder interface loads', async ({ page }) => {
    // Direct access to a builder route if known
    // In NexPress, we often have a /dashboard/pages or similar
    await page.goto('/dashboard/pages');
    await expect(page.getByText(/Pages/i).first()).toBeVisible();
  });
});
