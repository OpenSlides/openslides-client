import { test, expect, BrowserContext } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe(`Testing permission- and auth-guards`, () => {
    const DELEGATE_NAME = `a`;
    const ADMIN_NAME = `admin`;
    const DEFAULT_MEETING_ID = 1;

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
});
