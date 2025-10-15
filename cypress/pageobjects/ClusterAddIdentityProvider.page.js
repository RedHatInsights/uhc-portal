import Page from './page';

class ClusterAddIdentityProviderDetails extends Page {
  selectAddIdentityProviderDropdown = () => cy.get('button[id="add-identity-provider"]');

  isEditIdpPageTitle(index) {
    cy.contains('h1', /Edit identity provider: */);
  }

  filterByUsernameField = () => cy.get('input[aria-label="Filter by username"]');

  clickHtpasswdButton = () => cy.get('button').contains('htpasswd').click();

  inputHtpasswdName = () => cy.get('#name');

  inputHtpasswdUserNameField = () => cy.get(`input[id="users.0.username"]`);

  editConsoleURLDialogInput = () => cy.get('input[id="edit-console-url-input"]');

  isTextContainsInPage(text, present = true) {
    if (present) {
      cy.contains(text).should('be.exist');
    } else {
      cy.contains(text).should('not.exist');
    }
  }
  inputPasswordField = () => cy.get('[id="users.0.password"]');

  inputConfirmPasswordField = () => cy.get('[id="users.0.password-confirm"]');

  inputHtpasswdPasswordField(index = 0) {
    cy.get(`input[id="users.${index}.password"]`).click({ force: true });
    cy.contains('div', 'Use suggested password:').click({ force: true });
  }

  inputHtpasswdConfirmPasswordField(index = 0) {
    cy.get(`input[id="users.${index}.password-confirm"]`).click({ force: true });
  }

  addUserButton = () => cy.get('button[label="Add user"]');

  editModalAddUserButton = () => cy.get('button').contains('Add user');

  clickAddUserModalButton = () => cy.get('button[type="submit"]').contains('Add user').click();

  clickAddButton = () => cy.get('button[type="submit"]').click({ force: true });

  cancelButton = () => cy.contains('a', 'Cancel').click();

  accessControlTabLink = () => cy.contains('a', 'Access control').should('be.visible').click();

  removeUserList = () =>
    //cy.get('div[data-testid="remove-users"]').first(); // for executing in dev env
    cy.get('.pf-m-1-col.field-grid-item.minus-button').first(); // for executing in current staging env

  clickPerPageItem(count) {
    cy.get('button[role="menuitem"]').contains(count).scrollIntoView().click();
  }

  verifyEditIdentityProviderTableElementValues(property) {
    cy.get('table[role="grid"] tbody[role="rowgroup"] tr').should('have.length', property);
  }

  waitForAddUserModalToLoad = () => {
    cy.get('div[aria-label="Add user"]').should('not.exist');
  };

  waitForDeleteClusterActionComplete = () => {
    cy.get('div[aria-label="Remove identity provider"]', { timeout: 15000 }).should('not.exist');
  };

  waitForAddButtonSpinnerToComplete = () => {
    cy.get('button[type="submit"]', { timeout: 10000 }).should('exist');
  };

  verifyIdentityProviderElementValues(property) {
    cy.get('table tr', { timeout: 20000 })
      .should('exist')
      .each(($row) => {
        if ($row.text().includes(property)) {
          cy.wrap($row).should('exist');
        }
      });
  }

  editHtpasswdIDPToggle(htpasswdName) {
    cy.contains('tr', htpasswdName).within(() => {
      cy.get('td button[aria-label="Kebab toggle"]').click({ force: true });
    });
    cy.get('ul[role="menu"]').contains('button', 'Edit').click({ force: true });
  }

  clickClearAllFiltersLink() {
    cy.get('button').contains('Clear all filters').click();
  }

  collapseIdpDefinitions(idpName) {
    cy.get('td[data-label="Name"]').contains(idpName, { timeout: 100000 }).click({ force: true });
  }

  deleteHtpasswdIDP(htpasswdName) {
    cy.get('table[aria-label="Identity Providers"]')
      .contains(htpasswdName)
      .parent()
      .within(() => {
        cy.get('td button[aria-label="Kebab toggle"]').click({ force: true });
      });
    cy.get('button[role="menuitem"][type="button"]').contains('Delete').click({ force: true });
    cy.get('button[data-testid="btn-primary"]').click({ force: true }, { timeout: 10000 });
  }
}

export default new ClusterAddIdentityProviderDetails();
