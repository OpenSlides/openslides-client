import { BrowserContext, Page, expect } from '@playwright/test';
import { updateOrganization } from './request';

export interface OIDCLoginOptions {
    username: string;
    password: string;
    expectedUserId?: number;
    waitForRedirect?: boolean;
    timeout?: number;
}

export interface OIDCConfig {
    keycloakBaseUrl: string;
    realm: string;
    clientId: string;
}

const DEFAULT_OIDC_CONFIG: OIDCConfig = {
    keycloakBaseUrl: 'http://localhost:8180',
    realm: 'openslides',
    clientId: 'openslides'
};

export class KeycloakLoginPage {
    private page: Page;
    private config: OIDCConfig;
    private defaultTimeout: number = 30000;

    constructor(page: Page, config: OIDCConfig = DEFAULT_OIDC_CONFIG) {
        this.page = page;
        this.config = config;
    }

    async waitForKeycloakLoginPage(timeout?: number): Promise<void> {
        const waitTimeout = timeout || this.defaultTimeout;
        // Wait for Keycloak login page - check for login-actions in URL or Keycloak-specific elements
        await expect(this.page).toHaveURL(/login-actions|\/auth\/realms\//, { timeout: waitTimeout });

        // Also wait for the login form to be visible
        await expect(this.page.locator('#username')).toBeVisible({ timeout: waitTimeout });
    }

    async fillUsername(username: string): Promise<void> {
        const usernameField = this.page.locator('#username');
        await usernameField.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        await usernameField.fill(username);
    }

    async fillPassword(password: string): Promise<void> {
        const passwordField = this.page.locator('#password');
        await passwordField.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        await passwordField.fill(password);
    }

    async clickLogin(): Promise<void> {
        const loginButton = this.page.locator('#kc-login');
        await loginButton.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        await loginButton.click();
    }

    async login(username: string, password: string): Promise<void> {
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.clickLogin();
    }

    async isOnKeycloakPage(): Promise<boolean> {
        const url = this.page.url();
        return url.includes('localhost:8180') || url.includes('keycloak') || url.includes('/auth/realms/');
    }
}

export async function oidcLogin(
    page: Page,
    options: OIDCLoginOptions
): Promise<void> {
    const {
        username,
        password,
        waitForRedirect = true,
        timeout = 30000
    } = options;

    const keycloakPage = new KeycloakLoginPage(page);
    await keycloakPage.waitForKeycloakLoginPage();
    await keycloakPage.login(username, password);

    if (waitForRedirect) {
        await expect(page).not.toHaveURL(/login-actions/, { timeout });
        await expect(page).not.toHaveURL(/\/login$/);
    }
}

/**
 * Initiate OIDC login with robust SSO button detection.
 * Uses a prioritized selector strategy for reliability.
 */
export async function initiateOIDCLogin(page: Page): Promise<void> {
    await page.goto('/login');

    // Wait for Angular app to be ready (don't use networkidle - it never completes due to WebSocket)
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
            console.log(`[OIDC Auth] Found SSO button with selector: ${selector}`);
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
        console.log('[OIDC Auth] Found SSO button via regex filter');
        await genericButton.click();
        return;
    }

    throw new Error(
        'No SSO login button found. Ensure OIDC is enabled and the button has ' +
            'data-testid="sso-login-button" attribute.'
    );
}

export async function performFullOIDCLogin(
    page: Page,
    username: string,
    password: string
): Promise<void> {
    await initiateOIDCLogin(page);

    await oidcLogin(page, { username, password });
}

export async function oidcLogout(page: Page, context: BrowserContext): Promise<void> {
    await page.locator('os-account-button > button').click();
    await page.getByText('Logout').first().click();
    await expect(page).toHaveURL('/login');
}

export async function enableOIDCForOrganization(context: BrowserContext): Promise<void> {
    const response = await context.request.post('/system/action/handle_request', {
        data: [
            {
                action: 'organization.update',
                data: [
                    {
                        id: 1,
                        oidc_enabled: true
                    }
                ]
            }
        ]
    });

    expect(response.ok()).toBeTruthy();
}

export async function disableOIDCForOrganization(context: BrowserContext): Promise<void> {
    const response = await context.request.post('/system/action/handle_request', {
        data: [
            {
                action: 'organization.update',
                data: [
                    {
                        id: 1,
                        oidc_enabled: false
                    }
                ]
            }
        ]
    });

    expect(response.ok()).toBeTruthy();
}

export async function enableSAMLForOrganization(context: BrowserContext, buttonText?: string): Promise<void> {
    const response = await context.request.post('/system/action/handle_request', {
        data: [
            {
                action: 'organization.update',
                data: [
                    {
                        id: 1,
                        saml_enabled: true,
                        ...(buttonText ? { saml_login_button_text: buttonText } : {})
                    }
                ]
            }
        ]
    });

    expect(response.ok()).toBeTruthy();
}

export async function disableSAMLForOrganization(context: BrowserContext): Promise<void> {
    const response = await context.request.post('/system/action/handle_request', {
        data: [
            {
                action: 'organization.update',
                data: [
                    {
                        id: 1,
                        saml_enabled: false
                    }
                ]
            }
        ]
    });

    expect(response.ok()).toBeTruthy();
}

/**
 * Set organization to standard login mode (no SAML - shows username/password form).
 * Note: oidc_enabled cannot be modified via organization.update, so we only control saml_enabled.
 */
export async function setStandardLoginMode(context: BrowserContext): Promise<void> {
    await updateOrganization(context, {
        saml_enabled: false
    });
}

/**
 * Set organization to SAML login mode (shows SSO button).
 * Note: oidc_enabled cannot be modified via organization.update, so we only control saml_enabled.
 */
export async function setSAMLLoginMode(context: BrowserContext, buttonText: string = 'SSO Login'): Promise<void> {
    await updateOrganization(context, {
        saml_enabled: true,
        saml_login_button_text: buttonText
    });
}

export async function isKeycloakAvailable(baseUrl: string = 'http://localhost:8180'): Promise<boolean> {
    try {
        const response = await fetch(`${baseUrl}/auth/realms/openslides/.well-known/openid-configuration`);
        return response.ok;
    } catch {
        return false;
    }
}
