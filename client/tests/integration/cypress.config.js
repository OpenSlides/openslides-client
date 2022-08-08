const { defineConfig } = require('cypress')

module.exports = defineConfig({
    "e2e": {
        "baseUrl": "https://localhost:8000",
        "supportFile": "cypress/support/index.ts",
        "specPattern": "cypress/integration/**/*.spec.ts",
    },
    "pageLoadTimeout": 120000,
    "screenshotsFolder": "results/screenshots",
    "videosFolder": "results/videos",
    "downloadsFolder": "results/downloads"
});
