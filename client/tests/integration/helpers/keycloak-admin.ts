import * as crypto from 'crypto';
import * as fs from 'fs';

export interface RealmConfig {
    realm: string;
    enabled?: boolean;
    displayName?: string;
    attributes?: Record<string, string[]>;
    [key: string]: any;
}

export interface KeycloakUser {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface ClientSessionStats {
    id: string;
    clientId: string;
    active: number;
    offline: number;
}

/**
 * Keycloak Admin API Client for managing realms, sessions, and users
 */
export class KeycloakAdminClient {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(
        private baseUrl: string = process.env.KEYCLOAK_URL || 'http://localhost:8080',
        private adminUser: string = process.env.KEYCLOAK_ADMIN || 'admin',
        private adminPassword: string = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin'
    ) {}

    /**
     * Authenticate with Keycloak Admin API
     */
    async authenticate(): Promise<void> {
        // Return early if token is still valid (with 30s buffer)
        if (this.accessToken && Date.now() < this.tokenExpiry - 30000) {
            return;
        }

        const response = await fetch(
            `${this.baseUrl}/auth/realms/master/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'password',
                    client_id: 'admin-cli',
                    username: this.adminUser,
                    password: this.adminPassword
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Keycloak admin authentication failed: ${response.status} - ${error}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + data.expires_in * 1000;
    }

    /**
     * Make an authenticated API request to Keycloak Admin API
     */
    private async apiRequest(method: string, endpoint: string, body?: any): Promise<any> {
        await this.authenticate();

        const response = await fetch(`${this.baseUrl}/auth/admin${endpoint}`, {
            method,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Keycloak API error: ${method} ${endpoint} - ${response.status}: ${error}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    // ============ Realm Management ============

    /**
     * Check if a realm exists
     */
    async realmExists(realmName: string): Promise<boolean> {
        try {
            await this.apiRequest('GET', `/realms/${realmName}`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get realm configuration
     */
    async getRealm(realmName: string): Promise<RealmConfig | null> {
        try {
            return await this.apiRequest('GET', `/realms/${realmName}`);
        } catch {
            return null;
        }
    }

    /**
     * Get all realms
     */
    async getRealms(): Promise<RealmConfig[]> {
        return await this.apiRequest('GET', '/realms');
    }

    /**
     * Create a new realm from configuration
     */
    async createRealm(config: RealmConfig): Promise<void> {
        await this.apiRequest('POST', '/realms', config);
    }

    /**
     * Update existing realm
     */
    async updateRealm(realmName: string, config: Partial<RealmConfig>): Promise<void> {
        await this.apiRequest('PUT', `/realms/${realmName}`, config);
    }

    /**
     * Delete a realm
     */
    async deleteRealm(realmName: string): Promise<void> {
        await this.apiRequest('DELETE', `/realms/${realmName}`);
    }

    /**
     * Get realm attribute
     */
    async getRealmAttribute(realmName: string, attributeName: string): Promise<string | null> {
        const realm = await this.getRealm(realmName);
        return realm?.attributes?.[attributeName]?.[0] || null;
    }

    /**
     * Set realm attribute
     */
    async setRealmAttribute(realmName: string, attributeName: string, value: string): Promise<void> {
        const realm = await this.getRealm(realmName);
        if (!realm) throw new Error(`Realm ${realmName} not found`);

        const attributes = realm.attributes || {};
        attributes[attributeName] = [value];

        await this.updateRealm(realmName, { attributes });
    }

    // ============ Session Management ============

    /**
     * Get all users in a realm
     */
    async getUsers(realmName: string, max: number = 1000): Promise<KeycloakUser[]> {
        return await this.apiRequest('GET', `/realms/${realmName}/users?max=${max}`);
    }

    /**
     * Clear all sessions for a specific user by user ID
     */
    async clearUserSessions(realmName: string, userId: string): Promise<void> {
        await this.apiRequest('POST', `/realms/${realmName}/users/${userId}/logout`);
    }

    /**
     * Clear sessions for a user by username
     */
    async clearUserSessionsByUsername(realmName: string, username: string): Promise<void> {
        const users = await this.apiRequest(
            'GET',
            `/realms/${realmName}/users?username=${encodeURIComponent(username)}&exact=true`
        );

        if (users && users.length > 0) {
            await this.clearUserSessions(realmName, users[0].id);
            console.log(`[Keycloak Admin] Cleared sessions for user: ${username}`);
        }
    }

    /**
     * Clear ALL sessions in a realm
     */
    async clearAllRealmSessions(realmName: string): Promise<void> {
        try {
            // Logout all sessions via realm endpoint
            await this.apiRequest('POST', `/realms/${realmName}/logout-all`);
            console.log(`[Keycloak Admin] Cleared all sessions in realm ${realmName}`);
        } catch (error) {
            // Some Keycloak versions don't support logout-all, fallback to user-by-user
            console.warn(`[Keycloak Admin] logout-all failed, trying user-by-user logout`);
            const users = await this.getUsers(realmName);
            for (const user of users) {
                try {
                    await this.clearUserSessions(realmName, user.id);
                } catch {
                    // Ignore errors for individual users
                }
            }
        }
    }

    /**
     * Get active session count for a realm
     */
    async getActiveSessionCount(realmName: string): Promise<number> {
        const stats: ClientSessionStats[] = await this.apiRequest(
            'GET',
            `/realms/${realmName}/client-session-stats`
        );
        return stats.reduce((sum, client) => sum + (client.active || 0), 0);
    }

    // ============ Config Hash Management ============

    /**
     * Calculate SHA256 hash of realm configuration for change detection
     */
    static calculateConfigHash(config: RealmConfig): string {
        // Normalize config by removing dynamic fields that change between runs
        const normalized = { ...config };
        delete normalized.id;
        delete normalized.attributes;

        // Sort keys for consistent hashing
        const json = JSON.stringify(normalized, Object.keys(normalized).sort());
        return crypto.createHash('sha256').update(json).digest('hex').substring(0, 16);
    }

    /**
     * Load realm config from file and calculate hash
     */
    static loadRealmConfigWithHash(configPath: string): { config: RealmConfig; hash: string } {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent) as RealmConfig;
        const hash = this.calculateConfigHash(config);
        return { config, hash };
    }

    /**
     * Check if realm config matches expected hash
     */
    async isRealmConfigCurrent(realmName: string, expectedHash: string): Promise<boolean> {
        const currentHash = await this.getRealmAttribute(realmName, 'configHash');
        return currentHash === expectedHash;
    }

    // ============ Intelligent Realm Management ============

    /**
     * Ensure realm exists and is ready for testing.
     * Note: Realm creation from full export is not supported via Admin API.
     * Realms should be pre-created via Docker --import-realm or manually.
     */
    async ensureRealm(
        config: RealmConfig,
        configHash: string,
        options: { forceRecreate?: boolean } = {}
    ): Promise<{ created: boolean; updated: boolean; realmName: string }> {
        const realmName = config.realm;
        const exists = await this.realmExists(realmName);

        if (!exists) {
            throw new Error(
                `Realm '${realmName}' does not exist. ` +
                    `Ensure Keycloak is started with --import-realm and the realm config is mounted. ` +
                    `Run: docker compose -f dev/docker/docker-compose.dev.yml up -d keycloak`
            );
        }

        console.log(`[Keycloak Admin] Realm ${realmName} exists and is ready`);
        console.log(`[Keycloak Admin] Config hash: ${configHash} (for reference)`);
        return { created: false, updated: false, realmName };
    }

    /**
     * Create a unique test realm with a run ID suffix.
     * Uses Keycloak's partial import to replicate the base realm.
     */
    async createTestRealm(baseConfig: RealmConfig, runId: string): Promise<string> {
        const testRealmName = `${baseConfig.realm}-test-${runId}`;

        // First create an empty realm
        const minimalRealm: RealmConfig = {
            realm: testRealmName,
            enabled: true,
            displayName: `${baseConfig.displayName || baseConfig.realm} (Test ${runId})`,
            sslRequired: 'none',
            attributes: {
                createdAt: [Date.now().toString()],
                testRunId: [runId]
            }
        };

        console.log(`[Keycloak Admin] Creating test realm: ${testRealmName}`);
        await this.createRealm(minimalRealm);

        // Then use partial import to add clients, users, etc.
        const importConfig = {
            ...baseConfig,
            realm: testRealmName
        };

        // Remove fields that cause issues with partial import
        delete importConfig.id;
        delete importConfig.attributes;

        try {
            await this.apiRequest('POST', `/realms/${testRealmName}/partialImport`, {
                ifResourceExists: 'SKIP',
                ...importConfig
            });
        } catch (error) {
            console.warn(`[Keycloak Admin] Partial import warning (may be OK):`, error);
        }

        return testRealmName;
    }

    /**
     * Cleanup test realms older than specified age
     */
    async cleanupOldTestRealms(baseRealmName: string, maxAgeMinutes: number = 60): Promise<number> {
        const realms = await this.getRealms();
        const testRealmPrefix = `${baseRealmName}-test-`;
        let deletedCount = 0;

        for (const realm of realms) {
            if (realm.realm.startsWith(testRealmPrefix)) {
                // Check creation time from realm attributes
                const createdAt = realm.attributes?.createdAt?.[0];
                const age = createdAt ? (Date.now() - parseInt(createdAt)) / 60000 : maxAgeMinutes + 1;

                if (age > maxAgeMinutes) {
                    console.log(`[Keycloak Admin] Deleting old test realm: ${realm.realm} (age: ${Math.round(age)} min)`);
                    await this.deleteRealm(realm.realm);
                    deletedCount++;
                }
            }
        }

        return deletedCount;
    }
}

// Singleton instance for convenience
let _adminClient: KeycloakAdminClient | null = null;

export function getKeycloakAdminClient(): KeycloakAdminClient {
    if (!_adminClient) {
        _adminClient = new KeycloakAdminClient();
    }
    return _adminClient;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetKeycloakAdminClient(): void {
    _adminClient = null;
}
