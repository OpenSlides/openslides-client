import { test, expect, BrowserContext } from '@playwright/test';
import { login, logout } from './helpers/auth';
import { createAccount, createMeeting, deleteAccounts, deleteCommittees, deleteMeetings } from './helpers/request';

test.describe(`Testing permission- and auth-guards`, () => {
    const DELEGATE_NAME = `a`;
    const ADMIN_NAME = `admin`;
    const DEFAULT_MEETING_ID = 1;

    let username = `GuardTest`;
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

    test(`visit meeting as delegate`, async ({ context, page }) => {
        await login(context, DELEGATE_NAME);
        await page.goto(`/${DEFAULT_MEETING_ID}`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(new RegExp(`.*${DEFAULT_MEETING_ID}.*`));
    });

    test(`visit meeting as superadmin`, async ({ context, page }) => {
        await login(context, ADMIN_NAME);
        await page.goto(`/${DEFAULT_MEETING_ID}`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(new RegExp(`.*${DEFAULT_MEETING_ID}.*`));
    });

    test(`visit meeting as meeting admin`, async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/${meetingId}`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(new RegExp(`.*${meetingId}.*`));
    });

    test(`visit organization as delegate`, async ({ context, page }) => {
        await login(context, DELEGATE_NAME);
        await page.goto(`/`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(new RegExp(`.*${DEFAULT_MEETING_ID}.*`));
    });

    test(`visit organization as superadmin`, async ({ context, page }) => {
        await login(context, ADMIN_NAME);
        await page.goto(`/`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(`/`);
    });

    test(`visit organization as meeting admin`, async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(new RegExp(`.*${meetingId}.*`));
    });

    test(`visit organization settings as delegate`, async ({ context, page }) => {
        await login(context, DELEGATE_NAME);
        await page.goto(`/settings`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(new RegExp(`.*${DEFAULT_MEETING_ID}.*`));
    });

    test(`visit organization settings as superadmin`, async ({ context, page }) => {
        await login(context, ADMIN_NAME);
        await page.goto(`/settings`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*settings/);
    });

    test(`visit organization settings as meeting admin`, async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/settings`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(new RegExp(`.*${meetingId}.*`));
    });

    test(`visit organization info as delegate`, async ({ context, page }) => {
        await login(context, DELEGATE_NAME);
        await page.goto(`/info`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*info/);
    });

    test(`visit organization info as superadmin`, async ({ context, page }) => {
        await login(context, ADMIN_NAME);
        await page.goto(`/info`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*info/);
    });

    test(`visit organization info as meeting admin`, async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/info`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*info/);
    });

    test(`visit meeting autopilot as delegate`, async ({ context, page }) => {
        await login(context, DELEGATE_NAME);
        await page.goto(`/${DEFAULT_MEETING_ID}/autopilot`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*autopilot/);
    });

    test(`visit meeting autopilot as superadmin`, async ({ context, page }) => {
        await login(context, ADMIN_NAME);
        await page.goto(`/${DEFAULT_MEETING_ID}/autopilot`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*autopilot/);
    });

    test(`visit meeting autopilot as meeting admin`, async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/${meetingId}/autopilot`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*autopilot/);
    });

    test(`visit meeting settings as delegate`, async ({ context, page }) => {
        await login(context, DELEGATE_NAME);
        await page.goto(`/${DEFAULT_MEETING_ID}/settings`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).not.toHaveURL(/.*\/settings/);
        await expect(page).toHaveURL(new RegExp(`.*${DEFAULT_MEETING_ID}.*`));
    });

    test(`visit meeting settings as superadmin`, async ({ context, page }) => {
        await login(context, ADMIN_NAME);
        await page.goto(`/${DEFAULT_MEETING_ID}/settings`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*\/settings/);
        await expect(page).toHaveURL(new RegExp(`.*${DEFAULT_MEETING_ID}.*`));
    });

    test(`visit meeting settings as meeting admin`, async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/${meetingId}/settings`);
        await expect(page).not.toHaveURL(/.*(login|error).*/);
        await expect(page).toHaveURL(/.*\/settings/);
        await expect(page).toHaveURL(new RegExp(`.*${meetingId}.*`));
    });
});
