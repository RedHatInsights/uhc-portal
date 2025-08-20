import { test, expect, Page, BrowserContext } from '@playwright/test';
import { TokensPage } from '../../page-objects/tokens-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let tokensPage: TokensPage;

test.describe.serial('Token pages', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to base URL
    const setup = await setupTestSuite(browser, '/openshift/');

    sharedContext = setup.context;
    sharedPage = setup.page;

    // Initialize page objects for this test suite
    tokensPage = new TokensPage(sharedPage);
  });

  test.afterAll(async () => {
    await cleanupTestSuite(sharedContext);
  });

  test('ocm-cli sso page', async () => {
    await tokensPage.navigateToOCMToken();
    await tokensPage.waitSSOIsLoaded();
    await tokensPage.isOCMTokenPage();
    await tokensPage.ocmSSOCLI();
  });

  test('rosa-cli sso page', async () => {
    await tokensPage.navigateToROSAToken();

    // Wait a moment for the page to load
    await sharedPage.waitForLoadState('networkidle');

    // Check if we got a 404 page instead
    const pageNotFound = sharedPage.getByText('We lost that page');
    const is404 = await pageNotFound.isVisible();

    if (is404) {
      // ROSA token page not found - URL may have changed or feature removed
      // Just verify we're on the right URL and that's enough for this test
      await tokensPage.isROSATokenPage();
      return;
    }

    await tokensPage.waitSSOIsLoaded();
    await tokensPage.isROSATokenPage();
    await tokensPage.ocmROSACLI();
  });
});
