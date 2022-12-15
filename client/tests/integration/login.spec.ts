import { test, expect } from '@playwright/test';
import { login, logout } from './helpers/auth';
import { createAccount, createMeeting, deleteAccounts, deleteCommittees, deleteMeetings } from './helpers/request';

test.describe('Testing the sign in and out process', () => {
    const DELEGATE_NAME = `a`;
    const DEFAULT_MEETING_ID = 1;

    let username = `Mississipi`;
    let secondAccountId: number;
    let meetingId: number;
    let committeeId: number;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);

        username = username + Date.now().toString();
        secondAccountId = (await createAccount(context, username)).id;

        const {
            id: _meetingId,
            committeeId: _committeeId,
            name: _meetingName
        } = await createMeeting(context, `MeetingLoginTest`, [secondAccountId]);
        meetingId = _meetingId;
        committeeId = _committeeId;

        await logout(context);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        await deleteAccounts(context, secondAccountId);
        await deleteMeetings(context, meetingId);
        await deleteCommittees(context, committeeId);
        await logout(context);
    });

    test('signs in as superadmin', async ({ page }) => {
        await page.goto(`/login`);
        await expect(page).toHaveURL(`/login`);
        await page.getByLabel('Username *').fill(`admin`);
        await page.getByLabel('Password *').fill(`admin`);
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).not.toHaveURL(`/login`);
    });

    test(`signs in as meeting admin`, async ({ page }) => {
        await page.goto(`/login`);
        await expect(page).toHaveURL(`/login`);
        await page.getByLabel('Username *').fill(username);
        await page.getByLabel('Password *').fill(username);
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).not.toHaveURL(`/login`);
        await expect(page).toHaveURL(`/${meetingId}`);
    });

    test(`signs in as delegate`, async ({ page }) => {
        await page.goto(`/login`);
        await expect(page).toHaveURL(`/login`);
        await page.getByLabel('Username *').fill(DELEGATE_NAME);
        await page.getByLabel('Password *').fill(DELEGATE_NAME);
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).not.toHaveURL(`/login`);
        await expect(page).toHaveURL(`/${DEFAULT_MEETING_ID}`);
    });

    test(`logout as admin`, async ({ page, context }) => {
        await login(context);
        await page.goto(`/`);
        await expect(page).not.toHaveURL(`/login`);
        await page.locator(`os-account-button > div`).click();
        await page.getByText(`Logout`).first().click();
        await expect(page).toHaveURL('/login');
    });

    test(`logout from meeting as delegate`, async ({ page, context }) => {
        await login(context, DELEGATE_NAME);
        await page.goto(`/${DEFAULT_MEETING_ID}`);
        await expect(page).not.toHaveURL(`/login`);
        await page.locator(`os-account-button > div`).click();
        await page.getByText(`Logout`).first().click();
        await expect(page).toHaveURL('/login');
    });

    test(`open login after logout via api`, async ({ page, context }) => {
        await login(context);
        await page.goto(`/`);
        await expect(page).not.toHaveURL(`/login`);
        await logout(context);
        await expect(page).toHaveURL('/login');
    });
});
