import Page from './page';

class ClusterRolesAndAccess extends Page {
  addRoleButton = () => cy.get('button').contains('Add user');
  rolesTab = () => cy.get('button[aria-controls="rolesTabContent"]');
  clusterRolesAndAccessTab = () => cy.get('button[role="tab"').contains('Cluster Roles and Access');

  addUserModalTitle = () => cy.contains('h1', 'Add cluster user');
  userIDInput = () => cy.get('input[id="user-id"]');

  dedicatedAdminsCheck = () => cy.get('input[name="dedicated-admins"]');
  clusterAdminsCheck = () => cy.get('input[name="cluster-admins"]');
  addUserModalButton = () => cy.get('div[role="dialog"]').find('button[data-testid="btn-primary"]');
  cancelModalButton = () =>
    cy.get('div[role="dialog"]').find('button[data-testid="btn-secondary"]');

  getUserIDErrorText = () => {
    return cy.getByTestId('form-helper-error');
  };

  verifyUserInList(userID, group) {
    cy.contains('tr', userID).within(() => {
      cy.contains('td', group).should('be.visible');
    });
  }

  verifyUserNotInList(userID) {
    cy.get('#pf-tab-section-1-cluster-roles-access', { timeout: 10000 })
      .contains(userID)
      .should('not.exist');
  }

  deleteUser(userID) {
    cy.contains('tr', userID).within(() => {
      cy.get('button[aria-label="Kebab toggle"]').click({ force: true });
    });
    cy.get('button[role="menuitem"]').contains('Delete').click({ force: true });
  }

  isTextContainsInPage(text, present = true) {
    if (present) {
      cy.contains(text).should('exist');
    } else {
      cy.contains(text).should('not.exist');
    }
  }

  selectPermissionsCheckbox = (permissions) =>
    cy.get(`input[type="checkbox"][name="${permissions}"]`);

  waitForClosingModal = () => {
    cy.get('div[role="dialog"]', { timeout: 10000 }).should('not.exist');
  };
}

export default new ClusterRolesAndAccess();
