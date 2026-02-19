/**
 * OIDC Keycloak Sync E2E Tests
 *
 * Tests that user management operations in OpenSlides are synced to Keycloak
 * via the Keycloak Admin API. When OIDC admin API is enabled:
 * - Creating a user in OpenSlides creates them in Keycloak
 * - Updating user fields in OpenSlides updates them in Keycloak
 * - Setting a password in OpenSlides sets it in Keycloak
 * - Deleting a user in OpenSlides removes them from Keycloak
 *
 * Prerequisites:
 * - OpenSlides dev stack with OIDC overlay running (make dev oidc)
 * - Keycloak running on port 8180 with 'openslides' realm
 * - OIDC_ADMIN_API_ENABLED=true in backend config
 *
 * Run with: cd client && pnpm exec playwright test --config=tests/playwright.oidc.config.ts oidc-keycloak-sync
 */

import { test, expect, BrowserContext } from '@playwright/test';
import { getKeycloakAdminClient, KeycloakAdminClient } from './helpers/keycloak-admin';
import { createOIDCAdminContext } from './helpers/oidc-request';
import { os4request, deleteAccounts } from './helpers/request';

const OPENSLIDES_BASE_URL = process.env['BASE_URL'] || 'https://localhost:8000';
const KEYCLOAK_REALM = process.env['KEYCLOAK_REALM'] || 'openslides';

// OIDC provider URL for password verification
const OIDC_PROVIDER_URL = process.env['OIDC_PROVIDER_URL'] || 'http://localhost:8180/auth/realms/openslides';
const OIDC_CLIENT_ID = process.env['OIDC_CLIENT_ID'] || 'openslides-client';
const OIDC_CLIENT_SECRET = process.env['OIDC_CLIENT_SECRET'] || 'openslides-secret';

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

/**
 * Verify user can authenticate with given password in Keycloak
 * using the resource owner password credentials grant.
 */
async function verifyKeycloakPassword(username: string, password: string): Promise<boolean> {
    const tokenUrl = `${OIDC_PROVIDER_URL}/protocol/openid-connect/token`;
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'password',
                client_id: OIDC_CLIENT_ID,
                client_secret: OIDC_CLIENT_SECRET,
                username,
                password,
                scope: 'openid'
            })
        });
        return response.ok;
    } catch {
        return false;
    }
}

test.describe('OIDC Keycloak Sync - User Create', () => {
    let kcAdmin: KeycloakAdminClient;
    let adminContext: BrowserContext;
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
    });

    test.afterEach(async () => {
        // Cleanup OpenSlides users (which should also delete from Keycloak)
        for (const id of osUserIds) {
            try {
                await deleteAccounts(adminContext, id);
            } catch {
                // may already be deleted
            }
        }
        osUserIds = [];
    });

    test.afterAll(async () => {
        if (adminContext) {
            await adminContext.close();
        }
    });

    test('creating user via API syncs to Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_create');
        const email = `${username}@test.example.com`;
        const firstName = 'Keycloak';
        const lastName = 'SyncTest';

        // Create user in OpenSlides via API
        const result = await os4request(adminContext, 'user.create', {
            username,
            email,
            first_name: firstName,
            last_name: lastName,
            default_password: 'testpass123',
            is_active: true,
        });

        const userId = result.id;
        osUserIds.push(userId);

        // Give backend a moment to sync
        await new Promise(r => setTimeout(r, 1000));

        // Verify user was created in Keycloak
        const kcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);

        expect(kcUser).not.toBeNull();
        expect(kcUser!.username).toBe(username);
        expect(kcUser!.email).toBe(email);
        expect(kcUser!.firstName).toBe(firstName);
        expect(kcUser!.lastName).toBe(lastName);

        console.log(`[Test] User created in OpenSlides (id=${userId}) and found in Keycloak (id=${kcUser!.id})`);
    });

    test('creating user with password syncs password to Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_pass');
        const password = 'TestPass123!';

        // Create user with password
        const result = await os4request(adminContext, 'user.create', {
            username,
            default_password: password,
            is_active: true,
        });

        const userId = result.id;
        osUserIds.push(userId);

        // Give backend a moment to sync
        await new Promise(r => setTimeout(r, 1000));

        // Verify user exists in Keycloak
        const kcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);
        expect(kcUser).not.toBeNull();

        // Verify password works in Keycloak
        const canAuth = await verifyKeycloakPassword(username, password);
        expect(canAuth).toBe(true);

        console.log(`[Test] User created with password, can authenticate in Keycloak`);
    });
});

test.describe('OIDC Keycloak Sync - User Update', () => {
    let kcAdmin: KeycloakAdminClient;
    let adminContext: BrowserContext;
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
    });

    test.afterEach(async () => {
        for (const id of osUserIds) {
            try {
                await deleteAccounts(adminContext, id);
            } catch {
                // may already be deleted
            }
        }
        osUserIds = [];
    });

    test.afterAll(async () => {
        if (adminContext) {
            await adminContext.close();
        }
    });

    test('updating user email syncs to Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_email');

        // Create user
        const result = await os4request(adminContext, 'user.create', {
            username,
            email: `${username}@old.example.com`,
            is_active: true,
        });

        const userId = result.id;
        osUserIds.push(userId);

        await new Promise(r => setTimeout(r, 500));

        // Update email
        const newEmail = `${username}@new.example.com`;
        await os4request(adminContext, 'user.update', {
            id: userId,
            email: newEmail,
        });

        await new Promise(r => setTimeout(r, 1000));

        // Verify in Keycloak
        const kcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);
        expect(kcUser).not.toBeNull();
        expect(kcUser!.email).toBe(newEmail);

        console.log(`[Test] User email updated in OpenSlides and Keycloak`);
    });

    test('updating user first_name and last_name syncs to Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_name');

        // Create user
        const result = await os4request(adminContext, 'user.create', {
            username,
            first_name: 'Original',
            last_name: 'Name',
            is_active: true,
        });

        const userId = result.id;
        osUserIds.push(userId);

        await new Promise(r => setTimeout(r, 500));

        // Update names
        await os4request(adminContext, 'user.update', {
            id: userId,
            first_name: 'Updated',
            last_name: 'NewName',
        });

        await new Promise(r => setTimeout(r, 1000));

        // Verify in Keycloak
        const kcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);
        expect(kcUser).not.toBeNull();
        expect(kcUser!.firstName).toBe('Updated');
        expect(kcUser!.lastName).toBe('NewName');

        console.log(`[Test] User names updated in OpenSlides and Keycloak`);
    });

    test('deactivating user disables in Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_disable');

        // Create active user
        const result = await os4request(adminContext, 'user.create', {
            username,
            is_active: true,
        });

        const userId = result.id;
        osUserIds.push(userId);

        await new Promise(r => setTimeout(r, 500));

        // Verify initially enabled
        let kcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);
        expect(kcUser).not.toBeNull();
        // Note: Keycloak API returns enabled as part of user object

        // Deactivate user
        await os4request(adminContext, 'user.update', {
            id: userId,
            is_active: false,
        });

        await new Promise(r => setTimeout(r, 1000));

        // Fetch user again to check enabled status
        const updatedKcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);
        expect(updatedKcUser).not.toBeNull();
        expect(updatedKcUser!.enabled).toBe(false);

        console.log(`[Test] User deactivated in OpenSlides and disabled in Keycloak`);
    });
});

test.describe('OIDC Keycloak Sync - Password', () => {
    let kcAdmin: KeycloakAdminClient;
    let adminContext: BrowserContext;
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
    });

    test.afterEach(async () => {
        for (const id of osUserIds) {
            try {
                await deleteAccounts(adminContext, id);
            } catch {
                // may already be deleted
            }
        }
        osUserIds = [];
    });

    test.afterAll(async () => {
        if (adminContext) {
            await adminContext.close();
        }
    });

    test('user.set_password syncs to Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_setpw');
        const initialPassword = 'InitialPass123';
        const newPassword = 'NewPass456!';

        // Create user with initial password
        const result = await os4request(adminContext, 'user.create', {
            username,
            default_password: initialPassword,
            is_active: true,
        });

        const userId = result.id;
        osUserIds.push(userId);

        await new Promise(r => setTimeout(r, 1000));

        // Verify initial password works
        const initialAuth = await verifyKeycloakPassword(username, initialPassword);
        expect(initialAuth).toBe(true);

        // Change password via set_password action
        await os4request(adminContext, 'user.set_password', {
            id: userId,
            password: newPassword,
        });

        await new Promise(r => setTimeout(r, 1000));

        // Verify new password works, old doesn't
        const newAuth = await verifyKeycloakPassword(username, newPassword);
        const oldAuth = await verifyKeycloakPassword(username, initialPassword);

        expect(newAuth).toBe(true);
        expect(oldAuth).toBe(false);

        console.log(`[Test] Password changed via set_password, synced to Keycloak`);
    });

    test('user.generate_new_password syncs to Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_genpw');
        const initialPassword = 'InitialPass123';

        // Create user
        const createResult = await os4request(adminContext, 'user.create', {
            username,
            default_password: initialPassword,
            is_active: true,
        });

        const userId = createResult.id;
        osUserIds.push(userId);

        await new Promise(r => setTimeout(r, 1000));

        // Generate new password
        const genResult = await os4request(adminContext, 'user.generate_new_password', {
            id: userId,
        });

        // The generated password is returned in the result
        const generatedPassword = genResult.password;
        expect(generatedPassword).toBeTruthy();

        await new Promise(r => setTimeout(r, 1000));

        // Verify generated password works in Keycloak
        const canAuth = await verifyKeycloakPassword(username, generatedPassword);
        expect(canAuth).toBe(true);

        console.log(`[Test] Generated password synced to Keycloak`);
    });

    test('user.reset_password_to_default syncs to Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_resetpw');
        const defaultPassword = 'DefaultPass123';
        const changedPassword = 'ChangedPass456';

        // Create user with default password
        const result = await os4request(adminContext, 'user.create', {
            username,
            default_password: defaultPassword,
            is_active: true,
        });

        const userId = result.id;
        osUserIds.push(userId);

        await new Promise(r => setTimeout(r, 1000));

        // Change password
        await os4request(adminContext, 'user.set_password', {
            id: userId,
            password: changedPassword,
        });

        await new Promise(r => setTimeout(r, 500));

        // Verify changed password works
        let canAuth = await verifyKeycloakPassword(username, changedPassword);
        expect(canAuth).toBe(true);

        // Reset to default
        await os4request(adminContext, 'user.reset_password_to_default', {
            id: userId,
        });

        await new Promise(r => setTimeout(r, 1000));

        // Verify default password works now
        canAuth = await verifyKeycloakPassword(username, defaultPassword);
        expect(canAuth).toBe(true);

        // Changed password should no longer work
        canAuth = await verifyKeycloakPassword(username, changedPassword);
        expect(canAuth).toBe(false);

        console.log(`[Test] Password reset to default, synced to Keycloak`);
    });
});

test.describe('OIDC Keycloak Sync - User Delete', () => {
    let kcAdmin: KeycloakAdminClient;
    let adminContext: BrowserContext;

    test.beforeAll(async ({ browser }) => {
        const available = await checkOIDCMiddlewareAvailable();
        if (!available) {
            test.skip();
            return;
        }

        kcAdmin = getKeycloakAdminClient();
        await kcAdmin.authenticate();
        adminContext = await createOIDCAdminContext(browser);
    });

    test.afterAll(async () => {
        if (adminContext) {
            await adminContext.close();
        }
    });

    test('deleting user removes from Keycloak', async () => {
        const available = await checkOIDCMiddlewareAvailable();
        test.skip(!available, 'OIDC middleware not available');

        const username = uniqueName('kcsync_delete');

        // Create user
        const result = await os4request(adminContext, 'user.create', {
            username,
            is_active: true,
        });

        const userId = result.id;

        await new Promise(r => setTimeout(r, 1000));

        // Verify user exists in Keycloak
        let kcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);
        expect(kcUser).not.toBeNull();
        const kcUserId = kcUser!.id;

        // Delete user from OpenSlides
        await deleteAccounts(adminContext, userId);

        await new Promise(r => setTimeout(r, 1000));

        // Verify user no longer exists in Keycloak
        kcUser = await kcAdmin.getUserByUsername(KEYCLOAK_REALM, username);
        expect(kcUser).toBeNull();

        console.log(`[Test] User deleted from OpenSlides and Keycloak`);
    });
});

// Helper to get admin token for raw Keycloak API calls
async function getAdminToken(): Promise<string> {
    const response = await fetch(
        'http://localhost:8180/auth/realms/master/protocol/openid-connect/token',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'password',
                client_id: 'admin-cli',
                username: 'admin',
                password: 'admin'
            })
        }
    );
    const data = await response.json();
    return data.access_token;
}
