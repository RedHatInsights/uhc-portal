import Page from './page';

class OCMRolesAndAccess extends Page {
  accessControlTabButton = () => cy.get('[data-ouia-component-id="Access control"]');

  grantRoleButton = () => cy.getByTestId('grant-role-btn');

  OCMRolesAndAccessTable = () => cy.get('table[aria-label="OCM Roles and Access"]');

  OCMRolesAndAccessTableActionButton = () => cy.get('button[aria-label="Kebab toggle"] svg');

  OCMRolesAndAccessTableDeleteButton = () => cy.contains('button', 'Delete');

  grantRoleUserInput = () => cy.get('input[id="username"]');

  userInputError = () => cy.get('[class*="helper-text"] span');

  submitButton = () => cy.get('button[type="submit"]').should('have.text', 'Grant role');

  usernameCell = () => cy.get('td[data-label="Username"] span');

  waitForGrantRoleModalToClear = () => {
    cy.get('div[id="ocm-roles-access-dialog"]', { timeout: 30000 }).should('not.exist');
  };
}

export default new OCMRolesAndAccess();
