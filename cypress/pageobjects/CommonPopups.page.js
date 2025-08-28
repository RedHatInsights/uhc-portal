import Page from './page';

class CommonPopups extends Page {
  isClusterTransferAlertShown() {
    cy.get('h4').contains('Cluster ownership transfer initiated').should('be.visible');
  }

  isClusterTransferCancelAlertShown() {
    cy.get('h4').contains('Cluster ownership transfer canceled').should('be.visible');
  }

  closeAlert() {
    cy.get('button[aria-label="close-notification"]').click();
  }
}

export default new CommonPopups();
