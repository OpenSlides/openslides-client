import { FullConfig } from '@playwright/test';
import { KeycloakAdminClient } from './helpers/keycloak-admin';
import { loadTestState, clearTestState } from './helpers/test-state';

/**
 * Global teardown for OIDC E2E tests.
 *
 * This module runs after all OIDC tests to:
 * 1. Delete dynamic test realms (CI mode)
 * 2. Clear sessions for static realms (local mode)
 * 3. Clean up test state
 */

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';

async function globalTeardown(config: FullConfig): Promise<void> {
    console.log('[OIDC Teardown] Starting global teardown...');

    const state = loadTestState();
    if (!state) {
        console.log('[OIDC Teardown] No test state found, skipping cleanup');
        return;
    }

    console.log(`[OIDC Teardown] Run ID: ${state.runId}`);
    console.log(`[OIDC Teardown] Realm: ${state.realmName}`);
    console.log(`[OIDC Teardown] Dynamic realm: ${state.isDynamicRealm}`);

    try {
        const keycloakAdmin = new KeycloakAdminClient(KEYCLOAK_BASE_URL);
        await keycloakAdmin.authenticate();

        if (state.isDynamicRealm) {
            // CI mode: Delete the entire test realm
            console.log(`[OIDC Teardown] Deleting dynamic test realm: ${state.realmName}`);
            await keycloakAdmin.deleteRealm(state.realmName);
            console.log(`[OIDC Teardown] Realm ${state.realmName} deleted`);
        } else {
            // Local mode: Just clear sessions, keep realm for next run
            console.log(`[OIDC Teardown] Clearing sessions for realm: ${state.realmName}`);
            await keycloakAdmin.clearAllRealmSessions(state.realmName);
            console.log(`[OIDC Teardown] Sessions cleared for realm ${state.realmName}`);
        }

        console.log('[OIDC Teardown] Cleanup complete');
    } catch (error) {
        console.error('[OIDC Teardown] Error during cleanup:', error);
        // Don't fail the test run on teardown errors
    } finally {
        clearTestState();
    }
}

export default globalTeardown;
