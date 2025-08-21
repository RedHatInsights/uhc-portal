import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ReleasesPage } from '../../page-objects/releases-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

interface ProductVersion {
  name: string;
  type: string;
}

interface ProductLifecycleResponse {
  data: Array<{
    versions: ProductVersion[];
  }>;
}

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let releasesPage: ReleasesPage;
var currentVersion: string;

test.describe.serial('Releases pages tests', { tag: ['@smoke'] }, () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to releases page
    const setup = await setupTestSuite(browser, '/openshift/releases');
    sharedContext = setup.context;
    sharedPage = setup.page;
    releasesPage = new ReleasesPage(sharedPage);
  });

  test.afterAll(async () => {
    await cleanupTestSuite(sharedContext);
  });

  test('Check latest openshift release versions(OCP-41253)', async () => {
    // Intercept the network request
    const [response] = await Promise.all([
      sharedPage.waitForResponse(
        (resp) =>
          resp.url().includes('/product-life-cycles/api/v1/products?name=Openshift') &&
          resp.request().method() === 'GET',
      ),
      // Navigate to the page
      sharedPage.goto('/openshift/releases'),
    ]);
    releasesPage.isReleasesPage();
    // Parse the response JSON
    const data = await response.json();
    const all_versions = data.data[0].versions;

    // Map and normalize version types using the reusable method
    const mapped_versions = ReleasesPage.mapVersionTypes(all_versions, 6);
    currentVersion = mapped_versions[0].name;

    // Iterate and run checks
    for (const item of mapped_versions) {
      await releasesPage.checkChannelDetailAndSupportStatus(item.name, item.type);
    }
  });

  test('Check all the links from release page(OCP-41253)', async () => {
    if (!currentVersion) {
      throw new Error('Current version is not set.');
    }
    await releasesPage.checkReleasePageLinks(currentVersion);
  });
});
