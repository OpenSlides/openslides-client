/// <reference types="vitest/config" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
    },
    environment: 'jsdom'
  },
});
