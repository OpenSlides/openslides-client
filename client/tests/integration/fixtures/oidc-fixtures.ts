import { test as base, expect, Page, BrowserContext } from '@playwright/test';

import { login, logout } from '../helpers/auth';
import { KeycloakLoginPage } from '../helpers/oidc-auth';
import { getKeycloakAdminClient } from '../helpers/keycloak-admin';
import { loadTestState } from '../helpers/test-state';

/**
 * OIDC Test Fixtures
 *
 * Provides reusable fixtures for OIDC E2E tests with:
 * - Dynamic realm support (from global setup)
 * - Browser context isolation
 * - Automatic session cleanup
 */

export interface OIDCTestConfig {
    keycloakBaseUrl: string;
    keycloakRealm: string;
    openslidesBaseUrl: string;
    testUsers: {
        admin: { username: string; password: string; userId: number };
        testuser: { username: string; password: string; userId: number };
    };
}

function getOIDCConfig(): OIDCTestConfig {
    // Get realm from test state (set by global setup) or fallback to env/default
    const state = loadTestState();
    const realm = state?.realmName || process.env.KEYCLOAK_REALM || 'openslides';

    return {
        keycloakBaseUrl: process.env.KEYCLOAK_URL || 'http://localhost:8180',
        keycloakRealm: realm,
        openslidesBaseUrl: process.env.BASE_URL || 'https://localhost:8000',
        testUsers: {
            admin: { username: 'admin', password: 'admin', userId: 1 },
            testuser: { username: 'testuser', password: 'testpassword', userId: 2 }
        }
    };
}

export interface OIDCFixtures {
    oidcConfig: OIDCTestConfig;
    oidcEnabledContext: BrowserContext;
    isolatedContext: BrowserContext;
    isolatedPage: Page;
    keycloakPage: KeycloakLoginPage;
    cleanupSession: () => Promise<void>;
}

/**
 * OIDC is now configured via environment variables, not organization settings.
 * These functions are no-ops kept for test compatibility.
 * OIDC is enabled when the Traefik OIDC middleware is configured.
 */
async function enableOIDC(_context: BrowserContext): Promise<void> {
    // OIDC is enabled via Traefik middleware configuration, not organization settings.
    // This is a no-op for test compatibility.
}

async function disableOIDC(_context: BrowserContext): Promise<void> {
    // OIDC is enabled via Traefik middleware configuration, not organization settings.
    // This is a no-op for test compatibility.
}

/**
 * Extended test object with OIDC fixtures.
 */
export const test = base.extend<OIDCFixtures>({
    oidcConfig: async ({}, use) => {
        await use(getOIDCConfig());
    },

    /**
     * Isolated browser context with clean state.
     * Cookies are cleared before and after use.
     */
    isolatedContext: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: undefined, // Fresh state
            serviceWorkers: 'block' // Prevent SW interference
        });

        // Clear any cookies that might exist
        await context.clearCookies();

        await use(context);

        // Cleanup after test
        await context.clearCookies();
        await context.close();
    },

    /**
     * Page with isolated context and cleared storage.
     */
    isolatedPage: async ({ isolatedContext }, use) => {
        const page = await isolatedContext.newPage();

        // Clear local/session storage on navigation
        await page.addInitScript(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        await use(page);

        await page.close();
    },

    /**
     * Browser context with OIDC enabled in OpenSlides.
     */
    oidcEnabledContext: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: undefined,
            serviceWorkers: 'block'
        });

        await context.clearCookies();

        // Login as admin to enable OIDC
        await login(context);
        await enableOIDC(context);
        await logout(context);

        await use(context);

        // Cleanup: disable OIDC
        try {
            await login(context);
            await disableOIDC(context);
            await logout(context);
        } catch (error) {
            console.warn('[OIDC Fixture] Failed to disable OIDC in cleanup:', error);
        }

        await context.clearCookies();
        await context.close();
    },

    /**
     * Keycloak login page helper.
     */
    keycloakPage: async ({ page, oidcConfig }, use) => {
        const keycloakPage = new KeycloakLoginPage(page, {
            keycloakBaseUrl: oidcConfig.keycloakBaseUrl,
            realm: oidcConfig.keycloakRealm,
            clientId: 'openslides-client'
        });
        await use(keycloakPage);
    },

    /**
     * Session cleanup helper that clears Keycloak sessions for test users.
     */
    cleanupSession: async ({ oidcConfig }, use) => {
        const cleanup = async () => {
            try {
                const admin = getKeycloakAdminClient();
                await admin.authenticate();

                // Clear sessions for test users
                for (const userKey of ['admin', 'testuser'] as const) {
                    const user = oidcConfig.testUsers[userKey];
                    await admin.clearUserSessionsByUsername(oidcConfig.keycloakRealm, user.username);
                }
            } catch (error) {
                console.warn('[OIDC Fixture] Session cleanup warning:', error);
            }
        };

        await use(cleanup);

        // Auto-cleanup after test
        await cleanup();
    }
});

export { expect };

/**
 * Helper to wait for OIDC redirect to complete.
 */
export async function waitForOIDCRedirect(page: Page, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 30000;

    // Wait until we're no longer on the Keycloak login page
    await expect(page).not.toHaveURL(/login-actions/, { timeout });

    // Wait until we're no longer on OpenSlides login page
    await expect(page).not.toHaveURL(/\/login$/, { timeout });
}

/**
 * Helper to initiate OIDC login flow with robust button detection.
 */
export async function initiateOIDCFlow(page: Page): Promise<void> {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Wait for Angular app to be ready
    await page.waitForSelector('os-login-mask', {
        state: 'visible',
        timeout: 15000
    });

    // Prioritized selector strategy (most specific to least)
    const ssoSelectors = [
        '[data-testid="sso-login-button"]', // Preferred: explicit test ID
        '[data-cy="sso-login"]', // Alternative test attribute
        'button:has-text("SSO")', // Text-based fallback
        'button:has-text("OIDC")', // Alternative text
        'button:has-text("Single Sign")' // Full text variant
    ];

    for (const selector of ssoSelectors) {
        const button = page.locator(selector);
        const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);

        if (isVisible) {
            console.log(`[OIDC Fixture] Found SSO button with selector: ${selector}`);
            await button.click();
            return;
        }
    }

    // Last resort: find button containing SSO-related text via regex
    const genericButton = page
        .locator('button')
        .filter({
            hasText: /sso|oidc|single.?sign/i
        })
        .first();

    if (await genericButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('[OIDC Fixture] Found SSO button via regex filter');
        await genericButton.click();
        return;
    }

    throw new Error(
        'No SSO login button found. Ensure OIDC is enabled and the button has ' +
            'data-testid="sso-login-button" attribute.'
    );
}

/**
 * Helper to perform complete OIDC login.
 */
export async function performOIDCLogin(
    page: Page,
    keycloakPage: KeycloakLoginPage,
    username: string,
    password: string
): Promise<void> {
    await initiateOIDCFlow(page);

    // Wait for redirect to Keycloak
    await keycloakPage.waitForKeycloakLoginPage();

    // Perform login on Keycloak
    await keycloakPage.login(username, password);

    // Wait for redirect back to OpenSlides
    await waitForOIDCRedirect(page);
}
