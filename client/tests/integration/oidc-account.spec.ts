/**
 * OIDC Account Management E2E Tests
 *
 * Adapts the standard account.spec.ts tests for OIDC authentication mode.
 * Uses an OIDC admin browser context instead of standard login/logout,
 * so all API and browser interactions pass through the Traefik OIDC middleware.
 *
 * Prerequisites:
 * - OpenSlides dev stack with OIDC overlay running (make dev oidc)
 * - Keycloak running on port 8180 with 'openslides' realm
 *
 * Run with: cd client && pnpm exec playwright test --config=tests/playwright.oidc.config.ts oidc-account
 */

import { test, expect, BrowserContext, Page } from '@playwright/test';
import { createOIDCAdminContext } from './helpers/oidc-request';
import { createAccount, deleteAccounts, os4request } from './helpers/request';
import { ListComponent } from './page-objects/components/list-component';

const OPENSLIDES_BASE_URL = process.env['BASE_URL'] || 'https://localhost:8000';

let oidcAvailable: boolean | null = null;

async function checkOIDCMiddlewareAvailable(): Promise<boolean> {
    if (oidcAvailable !== null) return oidcAvailable;
    try {
        const response = await fetch(`${OPENSLIDES_BASE_URL}/oauth2/login`, { redirect: 'manual' });
        oidcAvailable = response.status === 302 || response.status === 307;
    } catch {
        oidcAvailable = false;
    }
    return oidcAvailable;
}

test.describe('OIDC Account Management', () => {
    let adminContext: BrowserContext;
    let account: { id: number; name: string };

    test.beforeAll(async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        if (!available) {
            test.skip();
            return;
        }

        adminContext = await createOIDCAdminContext(browser);
        account = await createAccount(adminContext, `OIDCTestAccount_${Date.now().toString()}`);
    });

    test.afterAll(async () => {
        if (adminContext) {
            try {
                await deleteAccounts(adminContext, account.id);
            } catch {
                // may already be deleted
            }
            await adminContext.close();
        }
    });

    /**
     * Helper: create a new page in a fresh OIDC-authenticated context.
     * Each test gets its own browser context with OIDC session cookies.
     */
    async function createOIDCPage(browser: any): Promise<{ context: BrowserContext; page: Page }> {
        const context = await createOIDCAdminContext(browser);
        const page = await context.newPage();
        return { context, page };
    }

    test('visit accounts page', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const { context, page } = await createOIDCPage(browser);

        await page.goto('/');
        await page.locator('a[href="/accounts"]').click();
        await expect(page).toHaveURL('/accounts');

        await page.close();
        await context.close();
    });

    test('visits one account', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const { context, page } = await createOIDCPage(browser);

        await page.goto('/accounts');
        const listComponent = new ListComponent(page);
        await listComponent.getRowByText(account.name).scrollIntoViewIfNeeded();
        await listComponent.getRowByText(account.name).click();
        await expect(page).toHaveURL(`/accounts/${account.id}`);
        await expect(page.locator('body')).toContainText(account.name);
        await page.locator('[data-cy=headbarBackButton]').click();
        await expect(page).toHaveURL('/accounts');

        await page.close();
        await context.close();
    });

    test('creates an account', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const { context, page } = await createOIDCPage(browser);

        await page.goto('/accounts');
        await page.locator('[data-cy=headbarMainButton]').click();
        await expect(page).toHaveURL('/accounts/create');

        const username = `OIDCCreate_${Date.now().toString()}`;
        await page.locator('[formcontrolname=username]').fill(username);
        await page.locator('[data-cy=headbarSaveButton]').click();

        await expect(page).not.toHaveURL('/accounts/create');
        await expect(page.locator('body')).toContainText(username);

        // Extract user ID from URL and clean up
        const url = page.url();
        const urlSegments = url.split('/');
        const newUserId = Number(urlSegments[urlSegments.length - 1]);
        await deleteAccounts(adminContext, newUserId);

        await page.close();
        await context.close();
    });

    test('updates an account', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const { context, page } = await createOIDCPage(browser);

        await page.goto('/accounts');
        const listComponent = new ListComponent(page);
        await listComponent.openRowMenu(listComponent.getRowByText(account.name));
        await page.locator(`a[href="/accounts/${account.id}/edit"]`).click();
        await expect(page).toHaveURL(`/accounts/${account.id}/edit`);

        const pronoun = 'OIDCTest';
        await page.locator('[formcontrolname=pronoun]').fill(pronoun);
        await page.locator('[data-cy=headbarSaveButton]').click();

        await expect(page).not.toHaveURL(`/accounts/${account.id}/edit`);
        await expect(page.locator('body')).toContainText(`(${pronoun})`);

        await page.close();
        await context.close();
    });

    test('receives account name change via autoupdate', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const { context, page } = await createOIDCPage(browser);

        await page.goto('/accounts');
        await page.locator(`a[href="/accounts/${account.id}"]`).click();
        await expect(page.locator('body')).toContainText(account.name);

        const updatedName = 'OIDC Updated Name';
        await os4request(adminContext, 'user.update', {
            id: account.id,
            first_name: updatedName
        });

        await expect(page.locator('body')).toContainText(updatedName);

        await page.close();
        await context.close();
    });

    test('deletes an account', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        // Create a temporary account to delete
        const delAccount = await createAccount(adminContext, `OIDCDelete_${Date.now().toString()}`);

        const { context, page } = await createOIDCPage(browser);

        await page.goto('/accounts');
        const listComponent = new ListComponent(page);
        await listComponent.openRowMenu(listComponent.getRowByText(delAccount.name));
        await page.locator('.mat-mdc-menu-content button', { hasText: 'Delete' }).first().click();
        await page.locator('os-user-delete-dialog button', { hasText: 'Yes, delete' }).first().click();
        await expect(listComponent.getRowByText(delAccount.name)).toBeHidden();

        await page.close();
        await context.close();
    });
});
