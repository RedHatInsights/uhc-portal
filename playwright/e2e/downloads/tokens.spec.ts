import { test } from '../../fixtures/pages';

test.describe.serial('Token pages', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ navigateTo, downloadsPage }) => {
    await navigateTo('downloads');
    await downloadsPage.isDownloadsPage();
  });

  test('ocm-cli sso page', async ({ tokensPage }) => {
    await tokensPage.viewApiTokenButton().click();
    await tokensPage.isOCMTokenPage();
    await tokensPage.waitSSOIsLoaded();
    await tokensPage.ocmSSOCLI();
  });

  test('rosa-cli sso page', async ({ navigateTo, tokensPage }) => {
    await navigateTo('token/rosa');
    await tokensPage.isROSATokenPage();
    await tokensPage.waitSSOIsLoaded();
    await tokensPage.ocmROSACLI();
  });
});
