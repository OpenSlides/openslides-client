import { Browser, BrowserContext, Page, expect } from '@playwright/test';
import { KeycloakLoginPage } from './oidc-auth';
import { login } from './auth';
import { os4request } from './request';

const OPENSLIDES_BASE_URL = process.env['BASE_URL'] || 'https://localhost:8000';

// OIDC provider URL reachable from both the test runner (host) and backend containers.
// Uses the Docker bridge gateway IP (172.17.0.1) so tokens obtained from this URL
// have an `iss` claim matching what the backend validates against.
const OIDC_PROVIDER_URL = process.env['OIDC_PROVIDER_URL'] || 'http://172.17.0.1:8180/auth/realms/openslides';
const OIDC_CLIENT_ID = process.env['OIDC_CLIENT_ID'] || 'openslides-client';
const OIDC_CLIENT_SECRET = process.env['OIDC_CLIENT_SECRET'] || 'openslides-secret';

/**
 * Perform OIDC login via the Traefik middleware flow.
 * Navigates to /oauth2/login, fills the Keycloak form, and waits for redirect back.
 */
export async function oidcBrowserLogin(page: Page, username: string, password: string): Promise<void> {
    await page.goto(`${OPENSLIDES_BASE_URL}/oauth2/login`);

    const keycloakPage = new KeycloakLoginPage(page);
    await keycloakPage.waitForKeycloakLoginPage(30000);
    await keycloakPage.login(username, password);

    // Wait for redirect back to OpenSlides (away from Keycloak)
    await expect(page).not.toHaveURL(/login-actions/, { timeout: 30000 });
    await expect(page).not.toHaveURL(/\/auth\/realms\//, { timeout: 15000 });
}

/**
 * Create a BrowserContext that has gone through the OIDC browser flow as admin
 * and also has standard OpenSlides authentication for backend API calls.
 *
 * The context has two layers of auth:
 * 1. OIDC session cookies - These satisfy the Traefik OIDC middleware so requests
 *    to protected routes (action, presenter, autoupdate) are forwarded to the backend.
 * 2. Standard OpenSlides HS256 auth token - Set via /system/auth/login (which is
 *    excluded from OIDC middleware). This authenticates with the backend's auth handler.
 *
 * This dual approach is needed because the backend's osauthlib auth handler currently
 * only supports HS256 tokens, not OIDC/Keycloak RS256 JWTs.
 */
export async function createOIDCAdminContext(
    browser: Browser,
    username: string = 'admin',
    password: string = 'admin'
): Promise<BrowserContext> {
    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        serviceWorkers: 'block',
        baseURL: OPENSLIDES_BASE_URL
    });

    const page = await context.newPage();

    // Step 1: OIDC browser login to get Traefik session cookies
    await oidcBrowserLogin(page, username, password);

    // Verify redirect back to OpenSlides
    await page.waitForURL(/localhost:8000/, { timeout: 15000 });

    // Verify OIDC session is valid via health check on a protected route
    const healthCheck = await context.request.get(`${OPENSLIDES_BASE_URL}/system/action/health/`);
    if (!healthCheck.ok()) {
        throw new Error(`OIDC admin context health check failed: ${healthCheck.status()}`);
    }

    await page.close();

    // Step 2: Standard OpenSlides login to get HS256 auth token for backend API calls.
    // /system/auth/login is excluded from the OIDC middleware, so this works without
    // OIDC cookies. The login() helper sets the 'authentication' extra header on the context.
    await login(context, username, password);

    return context;
}

/**
 * Get an OIDC access token from Keycloak using resource owner password grant.
 * Uses OIDC_PROVIDER_URL so the token's `iss` claim matches the backend's configured provider URL.
 */
export async function getKeycloakAccessToken(username: string, password: string): Promise<string> {
    const tokenUrl = `${OIDC_PROVIDER_URL}/protocol/openid-connect/token`;
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'password',
            client_id: OIDC_CLIENT_ID,
            client_secret: OIDC_CLIENT_SECRET,
            username,
            password,
            scope: 'openid profile email'
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get Keycloak access token for '${username}': ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Call an OpenSlides presenter via the handle_request endpoint.
 */
export async function callPresenter(
    context: BrowserContext,
    presenter: string,
    data: any = {}
): Promise<any> {
    const response = await context.request.post('/system/presenter/handle_request', {
        data: [{ presenter, data }]
    });

    if (!response.ok()) {
        const error = await response.text();
        throw new Error(`Presenter '${presenter}' failed: ${response.status()} - ${error}`);
    }

    const results = await response.json();
    return results[0];
}

// Backend presenter port - accessible directly from host, bypasses Traefik OIDC middleware.
// The oidc_who_am_i presenter validates tokens itself and doesn't need OIDC session cookies.
const BACKEND_PRESENTER_URL = process.env['BACKEND_PRESENTER_URL'] || 'http://localhost:9003';

/**
 * Trigger OIDC user provisioning by calling the oidc_who_am_i presenter directly
 * on the backend's presenter port, bypassing Traefik's OIDC middleware.
 */
export async function triggerOIDCProvisioning(
    _context: BrowserContext,
    accessToken: string
): Promise<{
    user_id: number;
    keycloak_id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    provisioned: boolean;
}> {
    const response = await fetch(`${BACKEND_PRESENTER_URL}/system/presenter/handle_request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ presenter: 'oidc_who_am_i', data: { access_token: accessToken } }])
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Presenter 'oidc_who_am_i' failed: ${response.status} - ${error}`);
    }

    const results = await response.json();
    return results[0];
}

/**
 * Ensure the organization has correct OIDC settings for the oidc_who_am_i presenter.
 */
export async function ensureOIDCOrgSettings(context: BrowserContext): Promise<void> {
    await os4request(context, 'organization.update', {
        id: 1,
        oidc_enabled: true,
        oidc_provider_url: OIDC_PROVIDER_URL,
        oidc_client_id: OIDC_CLIENT_ID,
        oidc_client_secret: OIDC_CLIENT_SECRET,
        oidc_login_button_text: 'OIDC Login'
    });
}

/**
 * Search for an OpenSlides user by username using the search_users presenter.
 */
export async function findOSUserByUsername(
    context: BrowserContext,
    username: string
): Promise<{ id: number; username: string; first_name: string; last_name: string; email: string } | null> {
    try {
        const result = await callPresenter(context, 'search_users', {
            permission_type: 'organization',
            permission_id: 1,
            search: [{ username }]
        });
        // result is list[list[dict]] - one list per search criteria
        if (result && result[0] && result[0].length > 0) {
            return result[0][0];
        }
        return null;
    } catch {
        return null;
    }
}
