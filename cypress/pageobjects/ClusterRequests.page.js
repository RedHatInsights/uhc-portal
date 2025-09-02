import Page from './page';

class ClusterRequests extends Page {
  isClusterRequestsUrl() {
    super.assertUrlIncludes('/openshift/cluster-request');
  }

  isClusterRequestsScreen() {
    cy.contains('h1', 'Cluster Requests');
  }

  isClusterTranferRequestHeaderPage(headerName = 'Transfer Ownership Request') {
    cy.contains('h2', headerName).should('be.visible');
  }

  isClusterTranferRequestContentPage(content) {
    cy.contains('p', content).should('be.visible');
  }

  clusterRequestsRefreshButton = () => cy.get('button[aria-label="Refresh"]');

  cancelTransferButton = () => cy.contains('button', 'Cancel Transfer');

  checkClusterRequestsTableHeaders(header) {
    cy.get('table[aria-label="Cluster transfer ownership"]')
      .find('th')
      .contains(header)
      .should('be.visible');
  }
  checkClusterRequestsRowByClusterName(
    name,
    status,
    type,
    currentOwner,
    transferRecipient,
    finalStatus = '',
  ) {
    cy.get('td[data-label="Name"]')
      .contains(name)
      .parents('tr')
      .within(() => {
        cy.get('td[data-label="Status"]').contains(status).should('be.visible');
        cy.get('td[data-label="Type"]').contains(type).should('be.visible');
        cy.get('td[data-label="Current Owner"]').contains(currentOwner).should('be.visible');
        cy.get('td[data-label="Transfer Recipient"]')
          .contains(transferRecipient)
          .should('be.visible');
        if (finalStatus) {
          cy.get('td').last().contains(finalStatus).should('be.visible');
        }
      });
  }
  cancelClusterRequestsByClusterName(name) {
    cy.get('td[data-label="Name"]')
      .contains(name)
      .parents('tr')
      .within(() => {
        cy.get('button').contains('Cancel').should('be.visible').click();
      });
    cy.get('h1').contains('Cancel cluster transfer');
    cy.get('p').contains(
      `This action cannot be undone. It will cancel the impending transfer for cluster ${name}`,
    );
    this.cancelTransferButton().click();
  }
}

export default new ClusterRequests();
