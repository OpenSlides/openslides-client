import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Playwright configuration for OIDC E2E tests.
 *
 * This config is optimized for CI/agent environments:
 * - Longer timeouts for OIDC redirects
 * - Retry logic for flaky external dependencies
 * - Proper artifact collection for debugging
 * - Headless mode with appropriate browser settings
 */

const isCI = !!process.env.CI;

const config: PlaywrightTestConfig = {
    testDir: './integration',
    testMatch: '**/oidc*.spec.ts',

    /* CI-optimized timeouts for OIDC flows (redirects to Keycloak) */
    timeout: isCI ? 90_000 : 60_000,

    expect: {
        /* CI-optimized timeout for OIDC-related expectations */
        timeout: isCI ? 20_000 : 15_000
    },

    /* Fail the build on CI if you accidentally left test.only in the source code */
    forbidOnly: isCI,

    /* Retry failed tests - OIDC tests can be flaky due to external dependencies */
    retries: isCI ? 3 : 1,

    /* Run tests sequentially to avoid session conflicts */
    workers: 1,
    fullyParallel: false,

    /* Reporter configuration */
    reporter: [
        ['html', { outputFolder: 'playwright-report-oidc' }],
        ['json', { outputFile: 'playwright-report-oidc/results.json' }],
        isCI ? ['github'] : ['list']
    ].filter(Boolean) as any,

    /* Global setup/teardown for OIDC tests */
    globalSetup: './integration/oidc-global-setup.ts',
    globalTeardown: './integration/oidc-global-teardown.ts',

    use: {
        /* Base URL - OpenSlides proxy */
        baseURL: process.env.BASE_URL || 'https://localhost:8000',

        /* Ignore HTTPS errors for self-signed certs */
        ignoreHTTPSErrors: true,

        /* Block service workers to avoid caching issues */
        serviceWorkers: 'block',

        /* CI-optimized action timeout for OIDC flows */
        actionTimeout: isCI ? 20_000 : 15_000,

        /* CI-optimized navigation timeout for redirects */
        navigationTimeout: isCI ? 45_000 : 30_000,

        /* Collect trace on first retry for debugging */
        trace: 'on-first-retry',

        /* Screenshot on failure */
        screenshot: 'only-on-failure',

        /* Video on failure for debugging OIDC flows */
        video: isCI ? 'on-first-retry' : 'off',

        /* Viewport settings */
        viewport: { width: 1280, height: 720 }
    },

    projects: [
        {
            name: 'oidc-chromium',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chromium'
            }
        }
        // Firefox disabled - browser not installed in this environment
        // {
        //     name: 'oidc-firefox',
        //     use: {
        //         ...devices['Desktop Firefox']
        //     }
        // }
    ],

    /* Output directory for test artifacts */
    outputDir: 'test-results-oidc/'
};

export default config;
