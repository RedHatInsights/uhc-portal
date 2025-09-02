import Page from './page';

class ClusterSupportPage extends Page {
  // Section visibility checks
  isNotificationContactVisible() {
    cy.contains('Notification contacts').should('be.visible');
  }

  isSupportCasesSectionVisible() {
    cy.contains('Support cases').should('be.visible');
  }

  // Element getters - return chainable elements
  getAddNotificationContactButton() {
    return cy.get('button').contains('Add notification contact').should('be.visible');
  }

  getAddContactButton() {
    return cy.getByTestId('btn-primary').should('exist');
  }

  getCancelButton() {
    return cy.getByTestId('btn-secondary').should('exist');
  }

  getOpenSupportCaseButton() {
    return cy.get('button').contains('Open support case');
  }

  getUsernameInput() {
    return cy.get('input[aria-label="user name"]').should('exist');
  }

  getDeleteButton() {
    return cy.get('button').contains('Delete').should('be.visible');
  }

  // Action methods
  deleteNotificationContactByUsername(username) {
    cy.get('table[aria-label="Notification Contacts"]').within(() => {
      cy.get('td')
        .contains(username)
        .should('exist')
        .parent()
        .within(() => {
          cy.get('button[aria-label="Kebab toggle"]').should('exist').click();
        });
    });
    cy.get('button').contains('Delete').click();
  }

  isTextContainsInPage(text, present = true) {
    if (present) {
      cy.contains(text).should('exist').scrollIntoView().should('be.visible');
    } else {
      cy.contains(text).should('not.exist');
    }
  }

  // Notification checks
  isSuccessNotificationVisible() {
    cy.contains('Notification contact added successfully').should('be.visible');
  }

  isDeleteNotificationVisible() {
    cy.contains('Notification contact deleted successfully').should('be.visible');
  }

  // Table verification methods
  checkSupportCaseTableHeaders() {
    cy.getByTestId('support-cases-table').within(() => {
      const expectedHeaders = [
        'Case ID',
        'Issue summary',
        'Owner',
        'Modified by',
        'Severity',
        'Status',
      ];
      expectedHeaders.forEach((header) => {
        cy.get('th').contains(header).should('be.visible');
      });
    });
  }

  checkNotificationContactTableHeaders() {
    cy.get('table[aria-label="Notification Contacts"]').within(() => {
      const expectedHeaders = ['Username', 'Email', 'First Name', 'Last Name'];
      expectedHeaders.forEach((header) => {
        cy.get('th').contains(header).should('be.visible');
      });
    });
  }

  checkNotificationContacts(username, firstName, lastName) {
    cy.get('table[aria-label="Notification Contacts"]').within(() => {
      cy.get('td').contains(username).should('be.visible');
      cy.get('td').contains(firstName).should('be.visible');
      cy.get('td').contains(lastName).should('be.visible');
    });
  }

  isNotificationContactModalVisible() {
    cy.get('h1').contains('Add notification contact').should('be.visible');
    cy.contains(
      'Identify the user to be added as notification contact. These users will be contacted in the event of notifications about this cluster.',
    ).should('be.visible');
  }
}

export default new ClusterSupportPage();
