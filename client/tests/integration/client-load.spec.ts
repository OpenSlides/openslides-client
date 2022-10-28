import { test, expect } from "@playwright/test";

test.describe('Load client', () => {
    test('successfully loads', async ({ page }) => {
        await page.goto(`/`);
        await expect(page).toHaveURL(`/login`);
        await expect(page.locator(`h1`)).toContainText(`Test Organization`);
    });
});
