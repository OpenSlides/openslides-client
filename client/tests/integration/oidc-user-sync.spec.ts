/**
 * OIDC User Sync E2E Tests
 *
 * Tests the auto-provisioning of Keycloak users into OpenSlides via the OIDC flow.
 * When a Keycloak user's access token is presented to the oidc_who_am_i presenter,
 * the backend validates the token, fetches user info from Keycloak, and creates
 * a corresponding OpenSlides user (save_keycloak_account action).
 *
 * Prerequisites:
 * - OpenSlides dev stack with OIDC overlay running (make dev oidc)
 * - Keycloak running on port 8180 with 'openslides' realm
 *
 * Run with: cd client && pnpm exec playwright test --config=tests/playwright.oidc.config.ts oidc-user-sync
 */

import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { getKeycloakAdminClient, KeycloakAdminClient } from './helpers/keycloak-admin';
import { KeycloakLoginPage } from './helpers/oidc-auth';
import {
    createOIDCAdminContext,
    oidcBrowserLogin,
    getKeycloakAccessToken,
    triggerOIDCProvisioning,
    ensureOIDCOrgSettings,
    findOSUserByUsername,
} from './helpers/oidc-request';
import { deleteAccounts } from './helpers/request';

const OPENSLIDES_BASE_URL = process.env['BASE_URL'] || 'https://localhost:8000';
const KEYCLOAK_REALM = process.env['KEYCLOAK_REALM'] || 'openslides';

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

function uniqueName(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

test.describe('OIDC User Sync', () => {
    let kcAdmin: KeycloakAdminClient;
    let adminContext: BrowserContext;

    // Track Keycloak user IDs for cleanup
    let kcUserIds: string[] = [];
    // Track OpenSlides user IDs for cleanup
    let osUserIds: number[] = [];

    test.beforeAll(async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        if (!available) {
            test.skip();
            return;
        }

        kcAdmin = getKeycloakAdminClient();
        await kcAdmin.authenticate();

        adminContext = await createOIDCAdminContext(browser);

        // Ensure organization OIDC settings are configured so the
        // oidc_who_am_i presenter can validate tokens and provision users
        await ensureOIDCOrgSettings(adminContext);
    });

    test.afterEach(async () => {
        // Cleanup Keycloak users
        for (const uid of kcUserIds) {
            try {
                await kcAdmin.deleteUser(KEYCLOAK_REALM, uid);
            } catch {
                // user may already be deleted
            }
        }
        kcUserIds = [];

        // Cleanup OpenSlides users
        for (const id of osUserIds) {
            try {
                await deleteAccounts(adminContext, id);
            } catch {
                // user may already be deleted or not exist
            }
        }
        osUserIds = [];
    });

    test.afterAll(async () => {
        if (adminContext) {
            await adminContext.close();
        }
    });

    /**
     * Helper: create a Keycloak user and set password.
     */
    async function createKCUser(opts: {
        username: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        enabled?: boolean;
    }): Promise<string> {
        const userId = await kcAdmin.createUser(KEYCLOAK_REALM, {
            username: opts.username,
            firstName: opts.firstName,
            lastName: opts.lastName,
            email: opts.email,
            enabled: opts.enabled
        });
        kcUserIds.push(userId);
        await kcAdmin.setUserPassword(KEYCLOAK_REALM, userId, 'testpass123');
        return userId;
    }

    /**
     * Helper: perform OIDC login in a fresh browser context and return the context + page.
     */
    async function oidcLoginAsUser(
        browser: Browser,
        username: string,
        password: string = 'testpass123'
    ): Promise<{ context: BrowserContext; page: Page }> {
        const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            serviceWorkers: 'block'
        });
        const page = await context.newPage();
        await oidcBrowserLogin(page, username, password);
        return { context, page };
    }

    test('auto-provisions user on first OIDC login', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('sync');
        await createKCUser({
            username,
            firstName: 'Auto',
            lastName: 'Provisioned',
            email: `${username}@test.example.com`
        });

        // Verify OIDC browser login redirects back to OpenSlides
        const { context, page } = await oidcLoginAsUser(browser, username);
        await page.waitForURL(/localhost:8000/, { timeout: 30000 });
        await page.close();
        await context.close();

        // Get access token and trigger provisioning via oidc_who_am_i presenter
        const accessToken = await getKeycloakAccessToken(username, 'testpass123');
        const result = await triggerOIDCProvisioning(adminContext, accessToken);

        expect(result.provisioned).toBe(true);
        expect(result.user_id).toBeGreaterThan(0);
        expect(result.keycloak_id).toBeTruthy();
        expect(result.first_name).toBe('Auto');
        expect(result.last_name).toBe('Provisioned');
        expect(result.email).toBe(`${username}@test.example.com`);

        osUserIds.push(result.user_id);

        // Also verify via search_users presenter
        const searchResult = await findOSUserByUsername(adminContext, username);
        expect(searchResult).not.toBeNull();
        expect(searchResult!.id).toBe(result.user_id);
    });

    test('returns existing user on subsequent login', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('resync');
        await createKCUser({
            username,
            firstName: 'Original',
            lastName: 'Name',
            email: `${username}@test.example.com`
        });

        // First call - provision the user
        const accessToken1 = await getKeycloakAccessToken(username, 'testpass123');
        const result1 = await triggerOIDCProvisioning(adminContext, accessToken1);
        expect(result1.provisioned).toBe(true);
        const userId = result1.user_id;

        // Second call - should return existing user without re-provisioning
        const accessToken2 = await getKeycloakAccessToken(username, 'testpass123');
        const result2 = await triggerOIDCProvisioning(adminContext, accessToken2);

        expect(result2.provisioned).toBe(false);
        expect(result2.user_id).toBe(userId);
        expect(result2.first_name).toBe('Original');
        expect(result2.last_name).toBe('Name');

        osUserIds.push(userId);
    });

    test('multiple users get separate accounts', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username1 = uniqueName('multi1');
        const username2 = uniqueName('multi2');

        await createKCUser({
            username: username1,
            firstName: 'User',
            lastName: 'One',
            email: `${username1}@test.example.com`
        });

        await createKCUser({
            username: username2,
            firstName: 'User',
            lastName: 'Two',
            email: `${username2}@test.example.com`
        });

        // Provision both users
        const token1 = await getKeycloakAccessToken(username1, 'testpass123');
        const result1 = await triggerOIDCProvisioning(adminContext, token1);

        const token2 = await getKeycloakAccessToken(username2, 'testpass123');
        const result2 = await triggerOIDCProvisioning(adminContext, token2);

        expect(result1.provisioned).toBe(true);
        expect(result2.provisioned).toBe(true);
        expect(result1.user_id).not.toBe(result2.user_id);
        expect(result1.last_name).toBe('One');
        expect(result2.last_name).toBe('Two');

        osUserIds.push(result1.user_id, result2.user_id);
    });

    test('maps all Keycloak fields to OpenSlides user correctly', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('fields');

        await createKCUser({
            username,
            firstName: 'Flävia',
            lastName: "O'Brien-Müller",
            email: `${username}@test.example.com`
        });

        const accessToken = await getKeycloakAccessToken(username, 'testpass123');
        const result = await triggerOIDCProvisioning(adminContext, accessToken);

        expect(result.provisioned).toBe(true);
        expect(result.user_id).toBeGreaterThan(0);
        // Keycloak UUID format
        expect(result.keycloak_id).toMatch(/^[0-9a-f-]{36}$/);
        // All fields mapped correctly (including special characters)
        expect(result.first_name).toBe('Flävia');
        expect(result.last_name).toBe("O'Brien-Müller");
        expect(result.email).toBe(`${username}@test.example.com`);

        osUserIds.push(result.user_id);
    });

    test('login with disabled Keycloak user fails', async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('disabled');

        await createKCUser({
            username,
            firstName: 'Disabled',
            lastName: 'User',
            enabled: false
        });

        const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            serviceWorkers: 'block'
        });
        const page = await context.newPage();

        // Navigate to OIDC login
        await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

        const keycloakPage = new KeycloakLoginPage(page);
        await keycloakPage.waitForKeycloakLoginPage(30000);
        await keycloakPage.login(username, 'testpass123');

        // Should stay on Keycloak with an error (account is disabled)
        await expect(page).toHaveURL(/login-actions|localhost:8[01]80|keycloak|172\.17\.0\.1/, { timeout: 15000 });

        // Error message should be visible on Keycloak page
        const errorMessage = page.locator('.alert-error, .kc-feedback-text, #input-error').first();
        await expect(errorMessage).toBeVisible({ timeout: 10000 });

        await page.close();
        await context.close();
    });
});
