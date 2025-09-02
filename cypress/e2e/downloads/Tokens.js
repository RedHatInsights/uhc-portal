import TokenPages from '../../pageobjects/Tokens.page';

describe('Token pages', { tags: ['ci', 'smoke'] }, () => {
  it('ocm-cli sso page', () => {
    TokenPages.navigateToOCMToken();
    TokenPages.waitSSOIsLoaded();
    TokenPages.isOCMTokenPage();
    TokenPages.ocmSSOCLI();
  });

  it('rosa-cli sso page', () => {
    TokenPages.navigateToROSAToken();
    TokenPages.waitSSOIsLoaded();
    TokenPages.isROSATokenPage();
    TokenPages.ocmROSACLI();
  });
});
