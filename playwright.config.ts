import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { timeouts } from './tests/fixtures/timeouts';

const envFile = process.env.ENV_FILE || '.env';
dotenv.config({ path: path.resolve(__dirname, 'envs', envFile) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list'], ['json', { outputFile: 'playwright-report/results.json' }]],
  timeout: timeouts.test,
  expect: { timeout: timeouts.expect },
  use: {
    baseURL: process.env.BASE_URL,
    ignoreHTTPSErrors: true,
    actionTimeout: timeouts.action,
    navigationTimeout: timeouts.navigation,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'admin setup', testMatch: '**/auth/admin.setup.ts' },
    {
      name: 'chromium',
      testMatch: '**/specs/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['admin setup'],
    },
  ],
});
