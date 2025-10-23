import { test as base, BrowserContext, Page } from '@playwright/test';
import { ClusterDetailsPage } from '../page-objects/cluster-details-page';
import { ClusterListPage } from '../page-objects/cluster-list-page';
import { DownloadsPage } from '../page-objects/downloads-page';
import { OCMRolesAndAccessPage } from '../page-objects/ocm-roles-access-page';
import { RegisterClusterPage } from '../page-objects/register-cluster-page';
import { TokensPage } from '../page-objects/tokens-page';
import { STORAGE_STATE_PATH } from '../support/playwright-constants';

/**
 * Worker-scoped fixtures - shared across all tests in a worker (suite-level)
 * Perfect for serial test suites where:
 * - Page objects are reused across tests
 * - Authentication is done once
 * - Tests build on each other's state
 */
type WorkerFixtures = {
  authenticatedContext: BrowserContext;
  authenticatedPage: Page;
  clusterDetailsPage: ClusterDetailsPage;
  clusterListPage: ClusterListPage;
  downloadsPage: DownloadsPage;
  ocmRolesAndAccessPage: OCMRolesAndAccessPage;
  registerClusterPage: RegisterClusterPage;
  tokensPage: TokensPage;
};

/**
 * Test-scoped fixtures - created fresh for each test
 */
type TestFixtures = {
  navigateTo: (
    url: string,
    options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' },
  ) => Promise<void>;
};

/**
 * Extended test with page object fixtures
 *
 * Usage for serial test suites:
 *   test.describe.serial('flow', () => {
 *     test('step 1', async ({ clusterListPage }) => { ... });
 *     test('step 2', async ({ registerClusterPage }) => { ... });
 *   });
 *
 * All page objects are worker-scoped (suite-level):
 * - Created once per worker
 * - Shared across all tests in the suite
 * - Perfect for serial tests that build on each other
 * - Efficient - no re-instantiation overhead
 *
 * Benefits:
 * - No manual page object initialization
 * - Suite-level reuse for serial tests
 * - Worker-scoped auth reused across tests (fast!)
 * - Type-safe dependency injection
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped: Authenticated context - created once per worker, closed when worker ends
  authenticatedContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        storageState: STORAGE_STATE_PATH,
      });
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: Authenticated page - shared across all tests in worker for serial flows
  authenticatedPage: [
    async ({ authenticatedContext }, use) => {
      const page = await authenticatedContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'worker' },
  ],

  // Override default page to use authenticated page for serial flows
  page: async ({ authenticatedPage }, use) => {
    await use(authenticatedPage);
  },

  // Test-scoped: navigateTo - Navigate to a URL with a clean state
  navigateTo: async ({ page }, use) => {
    const navigate = async (
      url: string,
      options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' },
    ) => {
      await page.goto(url, {
        waitUntil: options?.waitUntil || 'load',
      });
    };

    await use(navigate);
  },

  // Worker-scoped: ClusterDetailsPage instance - created once, reused across all tests in suite
  clusterDetailsPage: [
    async ({ authenticatedPage }, use) => {
      const pageObject = new ClusterDetailsPage(authenticatedPage);
      await use(pageObject);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: ClusterListPage instance - created once, reused across all tests in suite
  clusterListPage: [
    async ({ authenticatedPage }, use) => {
      const pageObject = new ClusterListPage(authenticatedPage);
      await use(pageObject);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: DownloadsPage instance - created once, reused across all tests in suite
  downloadsPage: [
    async ({ authenticatedPage }, use) => {
      const pageObject = new DownloadsPage(authenticatedPage);
      await use(pageObject);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: OCMRolesAndAccessPage instance - created once, reused across all tests in suite
  ocmRolesAndAccessPage: [
    async ({ authenticatedPage }, use) => {
      const pageObject = new OCMRolesAndAccessPage(authenticatedPage);
      await use(pageObject);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: RegisterClusterPage instance - created once, reused across all tests in suite
  registerClusterPage: [
    async ({ authenticatedPage }, use) => {
      const pageObject = new RegisterClusterPage(authenticatedPage);
      await use(pageObject);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: TokensPage instance - created once, reused across all tests in suite
  tokensPage: [
    async ({ authenticatedPage }, use) => {
      const pageObject = new TokensPage(authenticatedPage);
      await use(pageObject);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
