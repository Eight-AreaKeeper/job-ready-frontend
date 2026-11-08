import { defineConfig } from '@playwright/test';

// End-to-end tests against the REAL back end (front end <-> back end integration).
// Start the back end first (port 8000, test data on), then: npm run test:e2e
// Set PW_CHROMIUM to use a Chrome/Chromium binary that is already installed.
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: 'npm run dev -- --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
