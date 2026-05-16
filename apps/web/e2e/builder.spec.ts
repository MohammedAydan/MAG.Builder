import { test, expect } from '@playwright/test';

test.describe('Builder E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@example.com');
    await page.locator('input[name="password"]').fill('change-me-please');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test('pages collection is reachable from admin', async ({ page }) => {
    await page.goto('/admin/collections/pages');
    await expect(page).toHaveURL(/\/admin\/collections\/pages/);
  });

  test('legacy dashboard pages route redirects to admin', async ({ page }) => {
    await page.goto('/dashboard/pages');
    await expect(page).toHaveURL(/\/admin/);
  });
});
