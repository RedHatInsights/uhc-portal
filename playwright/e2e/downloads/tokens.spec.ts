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
    await tokensPage.waitSSOIsLoaded();
    await tokensPage.isROSATokenPage();
    await tokensPage.ocmROSACLI();
  });
});
