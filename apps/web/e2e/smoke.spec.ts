import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    // Expect the title to contain "NexPress" or similar if set in metadata
    await expect(page).toHaveTitle(/NexPress/i);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('admin can login and see dashboard', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials from .env defaults
    await page.locator('input[name="email"]').fill('admin@example.com');
    await page.locator('input[name="password"]').fill('change-me-please');
    
    // Click login button
    await page.locator('button[type="submit"]').click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check for dashboard elements
    await expect(page.getByText(/Dashboard/i).first()).toBeVisible();
  });

  test('admin can access search dashboard', async ({ page }) => {
    // Re-use session or login again
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@example.com');
    await page.locator('input[name="password"]').fill('change-me-please');
    await page.locator('button[type="submit"]').click();

    await page.goto('/dashboard/search');
    await expect(page.getByText(/Search/i).first()).toBeVisible();
  });

  test('admin can access analytics dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@example.com');
    await page.locator('input[name="password"]').fill('change-me-please');
    await page.locator('button[type="submit"]').click();

    await page.goto('/dashboard/analytics');
    await expect(page.getByText(/Analytics/i).first()).toBeVisible();
  });

  test('admin can access automation dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@example.com');
    await page.locator('input[name="password"]').fill('change-me-please');
    await page.locator('button[type="submit"]').click();

    await page.goto('/dashboard/automation');
    await expect(page.getByText(/Automation/i).first()).toBeVisible();
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
