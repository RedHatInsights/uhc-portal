import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load environment variables from playwright.env.json
 */
const envPath = path.resolve(__dirname, 'playwright.env.json');
if (fs.existsSync(envPath)) {
  const envConfig = JSON.parse(fs.readFileSync(envPath, 'utf8'));
  // Set environment variables from the JSON file
  Object.keys(envConfig).forEach(key => {
    if (typeof envConfig[key] === 'object') {
      process.env[key] = JSON.stringify(envConfig[key]);
    } else {
      process.env[key] = String(envConfig[key]);
    }
  });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './playwright',
  /* Run tests in files in sequence */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Always run tests in sequence with a single worker. */
  workers: 1,
  /* Global test timeout to prevent context closure */
  timeout: 300000, // 5 minutes per test
  /* Global setup - authentication handled once for all tests */
  globalSetup: require.resolve('./playwright/support/global-setup.ts'),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  /* Increase default timeout for all expectations */
  expect: {
    timeout: 10000,
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://console.dev.redhat.com/openshift/',

    /* Use global storage state from global setup */
    storageState: 'playwright/fixtures/storageState.json',

    /* Ignore HTTPS certificate errors globally */
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Default timeout for each action */
    actionTimeout: 15000,
    
    /* Default timeout for navigation */
    navigationTimeout: 60000,
  },

  /* Configure projects for major browsers */
  projects: (() => {
    const selectedBrowser = process.env.BROWSER || 'all';
    const allProjects = [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ];

    // If a specific browser is selected, return only that browser
    if (selectedBrowser !== 'all') {
      const selectedProject = allProjects.find(project => project.name === selectedBrowser);
      return selectedProject ? [selectedProject] : [allProjects[0]]; // Default to chromium if invalid browser
    }

    // Return all browsers if 'all' or no specific browser selected
    return allProjects;
  })(),

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

