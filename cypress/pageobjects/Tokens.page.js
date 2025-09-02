import Page from './page';
import GlobalNav from './GlobalNav.page';

class TokenPages extends Page {
  navigateToOCMToken() {
    GlobalNav.downloadsNavigation().click();
    cy.getByTestId('view-api-token-btn').scrollIntoView();
    cy.getByTestId('view-api-token-btn').click();
  }

  isOCMTokenPage() {
    super.assertUrlIncludes('/openshift/token');
  }

  navigateToROSAToken() {
    cy.visit('/token/rosa', { retryOnNetworkFailure: true });
  }

  waitTokenPageIsLoaded() {
    // If the app is still loading, there are several stages — blank page, then spinner, then OCM renders.
    // So the "no spinner" check is not very reliable; the "h1" check is the real deal.
    cy.get('.pf-v6-c-spinner', { timeout: 30000 }).should('not.exist');
    cy.get('h1', { timeout: 30000 })
      .scrollIntoView()
      .contains('OpenShift Cluster Manager')
      .should('be.visible');
  }

  // check load token part
  checkLoadToken = (buttonLabel) => {
    cy.contains('Connect with offline tokens');
    cy.getByTestId('load-token-btn').click();
    cy.getByTestId(`${buttonLabel}`).should('have.attr', 'href');
    cy.get('input[aria-label="Copyable token"]', { timeout: 50000 }).should('exist');
  };

  // check revoke previous tokens part
  checkRevokePrevousToken() {
    cy.contains('Revoke previous tokens');
    cy.contains('SSO application management').should('have.attr', 'href');
  }

  isROSATokenPage() {
    super.assertUrlIncludes('/token/rosa');
  }

  waitSSOIsLoaded() {
    // If the app is still loading, there are several stages — blank page, then spinner, then OCM renders.
    // So the "no spinner" check is not very reliable; the "h1" check is the real deal.
    cy.get('input', { timeout: 30000 }).first().should('exist');
    cy.get('h2', { timeout: 30000 }).contains('SSO Login').should('be.visible');
  }

  ocmSSOCLI() {
    cy.get('input[value="ocm login --use-auth-code"]').should('exist');
    cy.get('input[value="ocm login --use-device-code"]').should('exist');
  }

  ocmROSACLI() {
    cy.get('input[value="rosa login --use-auth-code"]').should('exist');
    cy.get('input[value="rosa login --use-device-code"]').should('exist');
  }
}

export default new TokenPages();
