import Page from './page';

class OCMRolesAndAccess extends Page {
  accessControlTabButton = () => cy.get('[data-ouia-component-id="Access control"]');

  grantRoleButton = () => cy.getByTestId('grant-role-btn');

  OCMRolesAndAccessTable = () => cy.get('table[aria-label="OCM Roles and Access"]');

  OCMRolesAndAccessTableActionButton = () =>
    cy.get('td > button[aria-label="Kebab toggle"]').focus();

  OCMRolesAndAccessTableDeleteButton = () => cy.get(' button');

  grantRoleUserInput = () => cy.get('input[id="username"]');

  userInputError = () => cy.get('');

  submitButton = () => cy.get('button[type="submit"]').should('have.text', 'Grant role');

  usernameCell = () => cy.get('td[data-label="Username"] span');

  waitForGrantRoleModalToClear = () => {
    cy.get('div[id="ocm-roles-access-dialog"]', { timeout: 30000 }).should('not.exist');
  };
}

export default new OCMRolesAndAccess();
