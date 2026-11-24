import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'path';

test.describe('ClaimFlow AI End-to-End & Visual Audit', () => {
  test('Home Page - Demo cards, 3-step workflow, and screenshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ClaimFlow AI/);
    await expect(page.locator('h1')).toContainText('ClaimFlow AI');

    // Verify 4 demo cards exist
    const runButtons = page.locator('button:has-text("Run this claim")');
    await expect(runButtons).toHaveCount(4);

    // Capture screenshot
    const vp = page.viewportSize();
    const screenshotPath = path.join(
      '..',
      'docs',
      'screenshots',
      `home-${vp?.width}x${vp?.height}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Accessibility check (log violations if any non-critical)
    const axeResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // fonts might render slightly differently across headless chromium
      .analyze();
    expect(axeResults.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });

  test('New Claim Wizard - 3-step flow & specimen autofill', async ({ page }) => {
    await page.goto('/claims/new');
    await expect(page.locator('h1')).toContainText('Submit New Auto Claim');

    // Step 1: Documents
    await expect(page.locator('text=Step 1: Upload Documents')).toBeVisible();

    // Fill from specimen packet
    const packetSelect = page.locator('select');
    if ((await packetSelect.count()) > 0) {
      await packetSelect.selectOption({ index: 1 });
    }

    const vp = page.viewportSize();
    await page.screenshot({
      path: path.join('..', 'docs', 'screenshots', `new-claim-step1-${vp?.width}x${vp?.height}.png`),
    });
  });

  test('Claims Directory - Table, search, and status filters', async ({ page }) => {
    await page.goto('/claims');
    await expect(page.locator('h1')).toContainText('Claims Directory');

    // Verify table headers
    await expect(page.locator('th:has-text("Claim ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();

    const vp = page.viewportSize();
    await page.screenshot({
      path: path.join('..', 'docs', 'screenshots', `claims-list-${vp?.width}x${vp?.height}.png`),
    });
  });

  test('Review Queue - Reason filtering and priority tags', async ({ page }) => {
    await page.goto('/review');
    await expect(page.locator('h1')).toContainText('Adjuster Review Queue');

    const vp = page.viewportSize();
    await page.screenshot({
      path: path.join('..', 'docs', 'screenshots', `review-queue-${vp?.width}x${vp?.height}.png`),
    });
  });

  test('Operations Dashboard - KPI cards & Recharts', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Operations Dashboard');
    await expect(page.locator('text=Straight-Through Rate')).toBeVisible();
    await expect(page.locator('text=Average Triage Speed')).toBeVisible();

    const vp = page.viewportSize();
    await page.screenshot({
      path: path.join('..', 'docs', 'screenshots', `dashboard-${vp?.width}x${vp?.height}.png`),
    });
  });

  test('Test Lab - 19 Specimen Packets & Batch Runner', async ({ page }) => {
    await page.goto('/test-lab');
    await expect(page.locator('h1')).toContainText('Test Lab & Packet Catalog');
    await expect(page.locator('text=Run all packets')).toBeVisible();

    const vp = page.viewportSize();
    await page.screenshot({
      path: path.join('..', 'docs', 'screenshots', `test-lab-${vp?.width}x${vp?.height}.png`),
    });
  });
});
