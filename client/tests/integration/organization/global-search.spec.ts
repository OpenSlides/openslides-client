import { test, expect } from '@playwright/test';
import { login, logout } from '../helpers/auth';
import { createAccount, createMeeting, deleteAccounts, deleteCommittees, deleteMeetings } from '../helpers/request';

test.describe('Testing global search', () => {
    let username = 'GlobalSearchTestUser';
    let meeting: { id: number; committeeId: number; name: string };
    let account: { id: number; name: string };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        username = username + Date.now().toString();
        account = await createAccount(context, username);
        meeting = await createMeeting(context, `Demo Meeting${Date.now().toString()}`, [account.id]);
        await logout(context);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        await deleteMeetings(context, meeting.id);
        await deleteCommittees(context, meeting.committeeId);
        await deleteAccounts(context, account.id);
        await logout(context);
    });

    test('search for demo meeting', async ({ context, page }) => {
        await login(context);
        await page.goto('/');
        await page.locator('button[aria-label="Global Search"]').click();
        await page.getByPlaceholder('Search').fill('Demo');
        await page.locator('input[value="meetings"]').click();
        await page.getByPlaceholder('Search').press('Enter');
        await expect(page.locator('.search-results-category')).toContainText('Demo Meeting');
        await logout(context);
    });

    test('search for blup meeting and find nothing', async ({ context, page }) => {
        await login(context);
        await page.goto('/');
        await page.locator('button[aria-label="Global Search"]').click();
        await page.getByPlaceholder('Search').fill('blup');
        await page.locator('input[value="meetings"]').click();
        await page.getByPlaceholder('Search').press('Enter');
        await expect(page.locator('h3.search-no-results')).toContainText('No results found');
        await logout(context);
    });
});
