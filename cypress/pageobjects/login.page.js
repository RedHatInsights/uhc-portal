/* eslint-disable class-methods-use-this */
import Page from './page';
import { getAuthConfig } from './authConfig';

class Login extends Page {
  get inputUsername() {
    return '#username-verification';
  }

  get inputPassword() {
    return '#password';
  }

  clickNextBtn = () =>
    cy.get('button').contains('Next').should('be.visible').click({ force: true });

  clickSubmitBtn = () =>
    cy.get('button[type="submit"]').should('be.visible').click({ force: true });

  isLoginPageUrl = () =>
    cy.url().should('include', 'auth/realms/redhat-external/protocol/openid-connect');

  isPasswordScreen = () => cy.contains('h1', 'Log in to your Red Hat account').should('be.visible');

  login() {
    cy.on('uncaught:exception', (err, runnable) => {
      // return false to prevent the error from failing this test
      console.error(`Cypress caught exception: ${err.message}`);
      return false;
    });

    const { username, password } = getAuthConfig();

    if (Cypress.env('GOV_CLOUD')) {
      cy.visit('', { retryOnNetworkFailure: true });

      this.loginFedRamp(username, password);
    } else {
      // visiting '/' will goto baseUrl defined in package.json
      // baseUrl ends in '.../openshift/'.  To goto sub-pages you
      // only need to specify relative path to baseUrl.
      // Ex: cy.visit('/create/osd');
      cy.visit('/', { retryOnNetworkFailure: true });
      this.isLoginPageUrl();

      cy.get(this.inputUsername).first().type(username, { force: true }); // there are 2 hidden username fields?!
      this.clickNextBtn();
      this.isPasswordScreen();
      cy.get(this.inputPassword).type(password, { force: true });
      this.clickSubmitBtn();
      this.closePendoIfShowing();
    }
  }

  loginFedRamp(username, password) {
    Cypress.on('uncaught:exception', (e) => {
      console.log(`Got application exception: ${e.message}`);

      return false;
    });
    cy.get('#username').type(username);
    cy.get('#kc-login').click();
    cy.get('#password').type(password);
    cy.get('#kc-login').click();
  }

  loginCommercial(username, password) {
    Cypress.on('uncaught:exception', (e) => {
      console.log(`Got application exception: ${e.message}`);

      return false;
    });
    cy.visit('');
    cy.get('#username-verification').should('be.visible');
    cy.get('#username-verification').type(username);
    cy.get('#username-verification').should('have.value', username);
    cy.get('#login-show-step2').click();
    cy.get('#password').should('be.visible');
    cy.get('#password').type(password);
    cy.get('#password').should('have.value', password);
    cy.get('#rh-password-verification-submit-button').click();
    cy.get('#rh-password-verification-submit-button').should('not.exist');
  }

  closePendoIfShowing() {
    // This might not work, it takes time for Pendo to pop up.
    const closePendoGuideBtn = '._pendo-close-guide';
    cy.get('body').then(($body) => {
      if ($body.find(closePendoGuideBtn).length) {
        cy.get(closePendoGuideBtn).should('be.visible').click();
        cy.get(closePendoGuideBtn).should('not.be.visible');
      }
    });
  }
}
export default new Login();
