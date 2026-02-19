import { FullConfig } from '@playwright/test';
import * as path from 'path';
import { KeycloakAdminClient } from './helpers/keycloak-admin';
import { generateRunId, saveTestState, isCI, TestRunState } from './helpers/test-state';

// Allow self-signed certificates for local development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Global setup for OIDC E2E tests.
 *
 * This module runs before all OIDC tests to:
 * 1. Verify Keycloak and OpenSlides are available
 * 2. Setup realm with intelligent management (reuse or create)
 * 3. Clear sessions for clean test state
 * 4. Warmup Keycloak endpoints
 */

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_URL || 'http://localhost:8180';
const OPENSLIDES_BASE_URL = process.env.BASE_URL || 'https://localhost:8000';
const REALM_CONFIG_PATH = path.resolve(__dirname, '../../../../dev/docker/keycloak/realm-openslides.json');
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2000;

// Use dynamic realms in CI for isolation, static realm locally for speed
const USE_DYNAMIC_REALM = process.env.OIDC_DYNAMIC_REALM === 'true' || isCI();

interface ServiceStatus {
    available: boolean;
    error?: string;
}

async function checkServiceAvailability(
    name: string,
    url: string,
    validateFn?: (response: Response) => Promise<boolean>
): Promise<ServiceStatus> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (validateFn) {
            const isValid = await validateFn(response);
            return { available: isValid };
        }

        return { available: response.ok || response.status < 500 };
    } catch (error: any) {
        return { available: false, error: error.message };
    }
}

async function waitForService(
    name: string,
    url: string,
    maxRetries: number = MAX_RETRIES,
    validateFn?: (response: Response) => Promise<boolean>
): Promise<boolean> {
    console.log(`[OIDC Setup] Waiting for ${name} at ${url}...`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const status = await checkServiceAvailability(name, url, validateFn);

        if (status.available) {
            console.log(`[OIDC Setup] ${name} is available (attempt ${attempt}/${maxRetries})`);
            return true;
        }

        if (attempt < maxRetries) {
            console.log(
                `[OIDC Setup] ${name} not ready (attempt ${attempt}/${maxRetries}): ${status.error || 'unavailable'}`
            );
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }

    console.error(`[OIDC Setup] ${name} failed to become available after ${maxRetries} attempts`);
    return false;
}

async function checkKeycloakBase(): Promise<boolean> {
    // Check master realm to verify Keycloak is running
    const wellKnownUrl = `${KEYCLOAK_BASE_URL}/auth/realms/master/.well-known/openid-configuration`;

    return waitForService('Keycloak', wellKnownUrl, MAX_RETRIES, async response => {
        if (!response.ok) return false;
        try {
            const config = await response.json();
            return !!(config.issuer && config.authorization_endpoint);
        } catch {
            return false;
        }
    });
}

async function checkKeycloakRealm(realmName: string): Promise<boolean> {
    const wellKnownUrl = `${KEYCLOAK_BASE_URL}/auth/realms/${realmName}/.well-known/openid-configuration`;

    return waitForService(`Keycloak Realm (${realmName})`, wellKnownUrl, 10, async response => {
        if (!response.ok) return false;
        try {
            const config = await response.json();
            return !!(config.issuer && config.authorization_endpoint && config.token_endpoint);
        } catch {
            return false;
        }
    });
}

async function checkJWKSEndpoint(realmName: string): Promise<boolean> {
    const jwksUrl = `${KEYCLOAK_BASE_URL}/auth/realms/${realmName}/protocol/openid-connect/certs`;

    return waitForService(`JWKS Endpoint (${realmName})`, jwksUrl, 5, async response => {
        if (!response.ok) return false;
        try {
            const jwks = await response.json();
            return !!(jwks.keys && jwks.keys.length > 0);
        } catch {
            return false;
        }
    });
}

async function warmupKeycloak(realmName: string, clientId: string, clientSecret: string): Promise<void> {
    console.log(`[OIDC Setup] Warming up Keycloak realm ${realmName}...`);

    const tokenUrl = `${KEYCLOAK_BASE_URL}/auth/realms/${realmName}/protocol/openid-connect/token`;

    try {
        // Perform a dummy token request to warm up the endpoint
        await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'password',
                client_id: clientId,
                client_secret: clientSecret,
                username: 'warmup-nonexistent',
                password: 'warmup'
            })
        });
    } catch {
        // Expected to fail, just warming up the endpoint
    }

    console.log(`[OIDC Setup] Warmup complete`);
}

async function checkOpenSlides(): Promise<boolean> {
    const loginUrl = `${OPENSLIDES_BASE_URL}/system/auth/`;
    return waitForService('OpenSlides', loginUrl, MAX_RETRIES);
}

async function setupRealm(keycloakAdmin: KeycloakAdminClient): Promise<TestRunState> {
    const runId = generateRunId();
    const { config, hash } = KeycloakAdminClient.loadRealmConfigWithHash(REALM_CONFIG_PATH);

    console.log(`[OIDC Setup] Config hash: ${hash}`);
    console.log(`[OIDC Setup] Dynamic realm mode: ${USE_DYNAMIC_REALM}`);

    let realmName: string;
    let isDynamicRealm: boolean;

    if (USE_DYNAMIC_REALM) {
        // CI mode: Create unique realm for this test run
        console.log(`[OIDC Setup] Creating dynamic test realm...`);

        // First cleanup old test realms (older than 60 minutes)
        const deleted = await keycloakAdmin.cleanupOldTestRealms(config.realm, 60);
        if (deleted > 0) {
            console.log(`[OIDC Setup] Cleaned up ${deleted} old test realm(s)`);
        }

        realmName = await keycloakAdmin.createTestRealm(config, runId);
        isDynamicRealm = true;
    } else {
        // Local mode: Reuse realm if config identical
        const result = await keycloakAdmin.ensureRealm(config, hash);
        realmName = result.realmName;
        isDynamicRealm = false;

        if (result.created) {
            console.log(`[OIDC Setup] Created new realm: ${realmName}`);
        } else if (result.updated) {
            console.log(`[OIDC Setup] Updated realm config: ${realmName}`);
        } else {
            console.log(`[OIDC Setup] Reusing existing realm: ${realmName}`);
            // Clear any existing sessions for clean test state
            await keycloakAdmin.clearAllRealmSessions(realmName);
        }
    }

    const state: TestRunState = {
        runId,
        startedAt: Date.now(),
        realmName,
        configHash: hash,
        isDynamicRealm
    };

    saveTestState(state);
    return state;
}

async function globalSetup(config: FullConfig): Promise<void> {
    console.log('[OIDC Setup] Starting global setup for OIDC tests...');
    console.log(`[OIDC Setup] Keycloak URL: ${KEYCLOAK_BASE_URL}`);
    console.log(`[OIDC Setup] OpenSlides URL: ${OPENSLIDES_BASE_URL}`);
    console.log(`[OIDC Setup] CI mode: ${isCI()}`);

    // Phase 1: Check basic service availability
    const [keycloakBaseReady, openslidesReady] = await Promise.all([checkKeycloakBase(), checkOpenSlides()]);

    if (!keycloakBaseReady) {
        throw new Error(
            '[OIDC Setup] Keycloak is not available. Ensure Keycloak is running:\n' +
                'docker compose -f dev/docker/docker-compose.dev.yml up -d keycloak'
        );
    }

    if (!openslidesReady) {
        throw new Error('[OIDC Setup] OpenSlides is not available. Ensure the dev stack is running:\nmake dev');
    }

    // Phase 2: Setup realm with intelligent management
    const keycloakAdmin = new KeycloakAdminClient(KEYCLOAK_BASE_URL);
    await keycloakAdmin.authenticate();

    const state = await setupRealm(keycloakAdmin);

    // Phase 3: Verify realm is fully operational
    const realmReady = await checkKeycloakRealm(state.realmName);
    if (!realmReady) {
        throw new Error(`[OIDC Setup] Realm ${state.realmName} is not accessible`);
    }

    const jwksReady = await checkJWKSEndpoint(state.realmName);
    if (!jwksReady) {
        throw new Error(`[OIDC Setup] JWKS endpoint for ${state.realmName} is not ready`);
    }

    // Phase 4: Warmup
    await warmupKeycloak(state.realmName, 'openslides-client', 'openslides-secret');

    // Set environment variables for tests
    process.env.KEYCLOAK_AVAILABLE = 'true';
    process.env.KEYCLOAK_REALM = state.realmName;
    process.env.TEST_RUN_ID = state.runId;

    console.log('[OIDC Setup] Global setup complete.');
    console.log(`[OIDC Setup] Using realm: ${state.realmName}`);
    console.log(`[OIDC Setup] Run ID: ${state.runId}`);
}

export default globalSetup;
