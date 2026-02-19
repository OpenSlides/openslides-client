/**
 * OIDC Login E2E Tests
 *
 * These tests verify the OIDC/Keycloak authentication flow via Traefik middleware.
 *
 * Prerequisites:
 * - OpenSlides dev stack running (make dev)
 * - docker-compose.oidc.yml overlay active (for OIDC tests)
 * - Keycloak running on port 8080
 * - Test users configured in Keycloak realm
 *
 * Run with: npx playwright test --config=playwright.oidc.config.ts
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { KeycloakLoginPage } from './helpers/oidc-auth';
import { login, logout } from './helpers/auth';
import { updateOrganization } from './helpers/request';

const OPENSLIDES_BASE_URL = process.env.BASE_URL || 'https://localhost:8000';

const TEST_USERS = {
    admin: { username: 'admin', password: 'admin', userId: 1 },
    testuser: { username: 'testuser', password: 'testpassword', userId: 2 }
};

// Cache OIDC availability check result
let oidcAvailable: boolean | null = null;

/**
 * Check if Traefik OIDC middleware is available.
 * The middleware intercepts /oauth2/login and redirects to Keycloak.
 */
async function checkOIDCMiddlewareAvailable(): Promise<boolean> {
    if (oidcAvailable !== null) {
        return oidcAvailable;
    }

    try {
        const response = await fetch(`${OPENSLIDES_BASE_URL}/oauth2/login`, {
            redirect: 'manual'
        });
        // If OIDC is enabled, we should get a redirect (302) to Keycloak
        oidcAvailable = response.status === 302 || response.status === 307;
    } catch {
        oidcAvailable = false;
    }

    console.log(`[OIDC Tests] Traefik OIDC middleware available: ${oidcAvailable}`);
    return oidcAvailable;
}

/**
 * Helper to configure organization settings via API.
 * Requires authentication first.
 */
async function configureLoginMode(
    browser: any,
    mode: 'standard' | 'saml'
): Promise<void> {
    const context = await browser.newContext();
    await login(context);

    if (mode === 'standard') {
        await updateOrganization(context, { saml_enabled: false });
    } else if (mode === 'saml') {
        await updateOrganization(context, {
            saml_enabled: true,
            saml_login_button_text: 'SSO Login'
        });
    }

    await logout(context);
    await context.close();
}

/**
 * Perform standard username/password login.
 */
async function performStandardLogin(
    page: Page,
    username: string,
    password: string
): Promise<void> {
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('Standard Login Flow', () => {
    // Skip entire describe block if OIDC middleware is enabled
    // OIDC protects API endpoints so configureLoginMode won't work
    test.beforeAll(async ({ browser }) => {
        const oidcEnabled = await checkOIDCMiddlewareAvailable();
        if (oidcEnabled) {
            console.log('[Standard Login Flow] Skipping - OIDC middleware is enabled');
            test.skip();
            return;
        }
        await configureLoginMode(browser, 'standard');
    });

    test('shows login page with username and password fields', async ({ page }) => {
        await page.goto(`${OPENSLIDES_BASE_URL}/login`);

        // Wait for Angular app to be ready (os-login-mask renders)
        await page.waitForSelector('os-login-mask', { state: 'visible', timeout: 15000 });

        // Click "Internal login" to expand the form if needed
        const internalLoginExpander = page.getByText('Internal login');
        if (await internalLoginExpander.isVisible({ timeout: 2000 }).catch(() => false)) {
            await internalLoginExpander.click();
            await page.waitForTimeout(500);
        }

        // Standard login fields should be visible
        const usernameField = page.getByLabel('Username');
        const passwordField = page.getByLabel('Password');

        await expect(usernameField).toBeVisible({ timeout: 15000 });
        await expect(passwordField).toBeVisible({ timeout: 15000 });
    });

    test('standard login works with admin credentials', async ({ page }) => {
        await page.goto(`${OPENSLIDES_BASE_URL}/login`);

        // Wait for Angular app to be ready
        await page.waitForSelector('os-login-mask', { state: 'visible', timeout: 15000 });

        // Click "Internal login" to expand the form if needed
        const internalLoginExpander = page.getByText('Internal login');
        if (await internalLoginExpander.isVisible({ timeout: 2000 }).catch(() => false)) {
            await internalLoginExpander.click();
            await page.waitForTimeout(500);
        }

        await performStandardLogin(page, 'admin', 'admin');

        // Verify login succeeded - should navigate away from login page
        await expect(page).not.toHaveURL(/\/login$/, { timeout: 15000 });

        // Account button should be visible
        await expect(page.locator('os-account-button')).toBeVisible({ timeout: 10000 });
    });

    test('logout redirects back to login page', async ({ page }) => {
        await page.goto(`${OPENSLIDES_BASE_URL}/login`);

        // Wait for Angular app to be ready
        await page.waitForSelector('os-login-mask', { state: 'visible', timeout: 15000 });

        // Click "Internal login" to expand the form if needed
        const internalLoginExpander = page.getByText('Internal login');
        if (await internalLoginExpander.isVisible({ timeout: 2000 }).catch(() => false)) {
            await internalLoginExpander.click();
            await page.waitForTimeout(500);
        }

        // Login first
        await performStandardLogin(page, 'admin', 'admin');
        await expect(page).not.toHaveURL(/\/login$/, { timeout: 15000 });

        // Logout
        await page.locator('os-account-button > button').click();
        await page.getByText('Logout').first().click();

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
});

test.describe('OIDC Login Flow', () => {
    /**
     * These tests require the Traefik OIDC middleware to be active.
     * Run with: docker compose -f docker-compose.dev.yml -f docker-compose.oidc.yml up
     *
     * The OIDC flow works by:
     * 1. Navigating to /oauth2/login
     * 2. Traefik redirects to Keycloak
     * 3. User authenticates on Keycloak
     * 4. Keycloak redirects back via /oauth2/callback
     * 5. Traefik validates token and sets session cookie
     */

    test.beforeAll(async () => {
        const available = await checkOIDCMiddlewareAvailable();
        if (!available) {
            console.log('[OIDC Tests] Skipping OIDC tests - Traefik OIDC middleware not available');
            console.log('[OIDC Tests] To enable: docker compose -f docker-compose.dev.yml -f docker-compose.oidc.yml up');
        }
    });

    test('redirects to Keycloak via /oauth2/login endpoint', async ({ page }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'Traefik OIDC middleware not available');

        // Navigate to the OIDC login endpoint
        await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

        // Should redirect to Keycloak (may use localhost:8180, keycloak hostname, or Docker bridge IP)
        await page.waitForURL(/localhost:8[01]80.*auth|keycloak|login-actions|172\.17\.0\.1:8[01]80/, { timeout: 15000 });

        // Verify Keycloak login form
        const keycloakPage = new KeycloakLoginPage(page);
        await keycloakPage.waitForKeycloakLoginPage(15000);
        expect(await keycloakPage.isOnKeycloakPage()).toBe(true);
    });

    test('can login via Keycloak with admin user', async ({ page }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'Traefik OIDC middleware not available');

        // Navigate to OIDC login
        await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

        // Wait for Keycloak
        const keycloakPage = new KeycloakLoginPage(page);
        await keycloakPage.waitForKeycloakLoginPage(15000);

        // Login on Keycloak
        await keycloakPage.login(TEST_USERS.admin.username, TEST_USERS.admin.password);

        // Wait for redirect back to OpenSlides
        await expect(page).not.toHaveURL(/login-actions/, { timeout: 15000 });
        await expect(page).not.toHaveURL(/keycloak/, { timeout: 15000 });

        // Should be on OpenSlides (not login page)
        await expect(page).toHaveURL(/localhost:8000/, { timeout: 15000 });
    });

    test('can login via Keycloak with testuser', async ({ page }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'Traefik OIDC middleware not available');

        // Navigate to OIDC login
        await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

        // Wait for Keycloak
        const keycloakPage = new KeycloakLoginPage(page);
        await keycloakPage.waitForKeycloakLoginPage(15000);

        // Login on Keycloak
        await keycloakPage.login(TEST_USERS.testuser.username, TEST_USERS.testuser.password);

        // Wait for redirect back to OpenSlides
        await expect(page).not.toHaveURL(/login-actions/, { timeout: 15000 });
        await expect(page).not.toHaveURL(/keycloak/, { timeout: 15000 });
    });

    test.fixme('handles Keycloak login cancellation gracefully', async ({ page }) => {
        // FIXME: Browser back button behavior is inconsistent with OIDC flow
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'Traefik OIDC middleware not available');

        // Navigate to OIDC login
        await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

        // Wait for Keycloak
        const keycloakPage = new KeycloakLoginPage(page);
        await keycloakPage.waitForKeycloakLoginPage(15000);

        // Go back (cancel login)
        await page.goBack();

        // Wait for navigation
        await page.waitForURL(/.*/, { timeout: 10000 });

        // User should be on OpenSlides or Keycloak (may use Docker bridge IP)
        const currentUrl = page.url();
        expect(
            currentUrl.includes('localhost:8000') ||
            currentUrl.includes('localhost:8180') ||
            currentUrl.includes('keycloak') ||
            currentUrl.includes('172.17.0.1:8180')
        ).toBeTruthy();
    });

    test.fixme('OIDC logout clears session', async ({ page }) => {
        // FIXME: Requires backend OIDC token validation integration
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'Traefik OIDC middleware not available');

        // Login via OIDC
        await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

        const keycloakPage = new KeycloakLoginPage(page);
        await keycloakPage.waitForKeycloakLoginPage(15000);
        await keycloakPage.login(TEST_USERS.admin.username, TEST_USERS.admin.password);

        // Wait for redirect back to OpenSlides
        await expect(page).not.toHaveURL(/login-actions/, { timeout: 15000 });
        await expect(page).toHaveURL(/localhost:8000/, { timeout: 15000 });

        // Navigate to a page that shows the account button
        await page.goto(`${OPENSLIDES_BASE_URL}/`);
        await page.waitForSelector('os-account-button', { state: 'visible', timeout: 10000 });

        // Logout from OpenSlides
        await page.locator('os-account-button > button').click();
        await page.getByText('Logout').first().click();

        // Should redirect to login or OIDC logout
        await expect(page).toHaveURL(/\/login|\/oauth2\/logout/, { timeout: 10000 });
    });
});

test.describe('Error Handling', () => {
    /**
     * Error handling tests for OIDC authentication.
     * Requires Traefik OIDC middleware to be active.
     */

    test('shows error for invalid credentials on Keycloak', async ({ page }) => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'Traefik OIDC middleware not available');

        // Navigate to OIDC login
        await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

        // Wait for Keycloak
        const keycloakPage = new KeycloakLoginPage(page);
        await keycloakPage.waitForKeycloakLoginPage(15000);

        // Try login with wrong credentials
        await keycloakPage.login('admin', 'wrongpassword');

        // Should stay on Keycloak with error
        await expect(page).toHaveURL(/login-actions|localhost:8180|keycloak/, { timeout: 10000 });

        // Error message should be visible
        const errorMessage = page.locator('.alert-error, .kc-feedback-text, #input-error');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
});
