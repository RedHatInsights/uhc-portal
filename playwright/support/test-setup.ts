import { Browser, BrowserContext, Page } from '@playwright/test';

export interface TestSuiteSetup {
  context: BrowserContext;
  page: Page;
}

/**
 * Common setup for test suites
 * Handles authentication and navigation to specified path
 */
export async function setupTestSuite(browser: Browser, path: string): Promise<TestSuiteSetup> {
  // Create context with global authentication state
  const context = await browser.newContext({
    storageState: 'playwright/fixtures/storageState.json',
  });
  const page = await context.newPage();

  // Navigate to specified path
  await page.goto(path);

  return { context, page };
}

/**
 * Common cleanup function for test suites
 */
export async function cleanupTestSuite(context: BrowserContext): Promise<void> {
  await context?.close();
}
