import { test } from '../../fixtures/pages';

test.describe.serial('Token pages', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ page }) => {
    // Navigate to base URL
    await page.goto('/openshift/');
  });

  test('ocm-cli sso page', async ({ tokensPage }) => {
    await tokensPage.navigateToOCMToken();
    await tokensPage.waitSSOIsLoaded();
    await tokensPage.isOCMTokenPage();
    await tokensPage.ocmSSOCLI();
  });

  test('rosa-cli sso page', async ({ tokensPage }) => {
    await tokensPage.navigateToROSAToken();
    await tokensPage.waitSSOIsLoaded();
    await tokensPage.isROSATokenPage();
    await tokensPage.ocmROSACLI();
  });
});
