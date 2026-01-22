/// <reference types="vitest/config" />

// Configure Vitest (https://vitest.dev/config/)

import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenSlides Poll',
      fileName: 'poll',
    },
    sourcemap: true
  },
  plugins: [dts()],
  test: {
    typecheck: {
      enabled: true,
    },
    environment: 'jsdom',
    coverage: {
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ['text', 'json-summary', 'json'],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
    }
  },
});
