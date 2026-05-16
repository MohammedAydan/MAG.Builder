import { test, expect } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('admin@example.com');
  await page.locator('input[name="password"]').fill('change-me-please');
  await page.locator('button[type="submit"]').click();
}

test.describe('Smoke Tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NexPress/i);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('admin login resolves to /admin', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('legacy dashboard route redirects to /admin', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/search');
    await expect(page).toHaveURL(/\/admin\/collections\/search-index/);
  });

  test('legacy pages route redirects to pages collection', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/pages');
    await expect(page).toHaveURL(/\/admin\/collections\/pages/);
  });

  test('API health check works', async ({ request }) => {
    const health = await request.get('/api/health');
    expect(health.ok()).toBeTruthy();
    const json = await health.json();
    expect(json.status).toBe('ok');
  });

  test('API readiness check works', async ({ request }) => {
    const readiness = await request.get('/api/readiness');
    expect(readiness.ok()).toBeTruthy();
    const json = await readiness.json();
    expect(json.status).toBe('ready');
  });
});
