import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface TestRunState {
    runId: string;
    startedAt: number;
    realmName: string;
    configHash: string;
    isDynamicRealm: boolean;
}

const STATE_FILE = path.join(__dirname, '..', '.oidc-test-state.json');

/**
 * Generate a unique run ID for test isolation
 */
export function generateRunId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
}

/**
 * Save test state to file for use across setup/teardown
 */
export function saveTestState(state: TestRunState): void {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Load test state from file
 */
export function loadTestState(): TestRunState | null {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
    } catch (error) {
        console.warn('[Test State] Failed to load state:', error);
    }
    return null;
}

/**
 * Clear test state file
 */
export function clearTestState(): void {
    try {
        if (fs.existsSync(STATE_FILE)) {
            fs.unlinkSync(STATE_FILE);
        }
    } catch (error) {
        console.warn('[Test State] Failed to clear state:', error);
    }
}

/**
 * Detect if running in CI environment
 */
export function isCI(): boolean {
    return (
        process.env.CI === 'true' ||
        process.env.GITHUB_ACTIONS === 'true' ||
        process.env.GITLAB_CI === 'true' ||
        process.env.JENKINS_URL !== undefined
    );
}
