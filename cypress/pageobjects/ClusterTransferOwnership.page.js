import Page from './page';

class TransferOwnershipPage extends Page {
  isTransferClusterSection(header, summary) {
    cy.get('h3').contains(header).should('be.visible');
    cy.get('p').contains(summary).should('be.visible');
  }

  isTransferOwnershipDialogHeader(header) {
    cy.get('h1').contains(header).should('be.visible');
  }

  isTransferOwnershipProgressDialogHeader(header) {
    cy.get('h1').contains(header).should('be.visible');
  }
  isCancelTransferModel() {
    cy.get('h1').contains('Cancel cluster transfer').should('be.visible');
    cy.get('p')
      .contains('This action cannot be undone. It will cancel the impending transfer for cluster')
      .should('be.visible');
  }
  isTransferDetailsSection(dateOfRequest, username, transferredTo, status) {
    cy.get('h3')
      .contains('Transfer details')
      .parent()
      .within(() => {
        cy.contains('Requested by').scrollIntoView().next().contains(username).should('be.visible');
        cy.contains('Transfer to')
          .scrollIntoView()
          .next()
          .contains(transferredTo)
          .should('be.visible');
        cy.contains('Status').scrollIntoView().next().contains(status).should('be.visible');
        cy.contains('Status Description')
          .scrollIntoView()
          .next()
          .contains(
            'Cluster Transfer has been created and is waiting to be approved by the recipient',
          )
          .should('be.visible');
      });
  }

  isTransferOwnershipProgressDialogDetails(dateOfRequest, username, transferredTo, status) {
    cy.get('div[id="transfer-in-progress-modal"]').within(() => {
      cy.contains('Requested by').scrollIntoView().next().contains(username).should('be.visible');
      cy.contains('Transfer to')
        .scrollIntoView()
        .next()
        .contains(transferredTo)
        .should('be.visible');
      cy.contains('Status').scrollIntoView().next().contains(status).should('be.visible');
      cy.contains('Status Description')
        .scrollIntoView()
        .next()
        .contains(
          'Cluster Transfer has been created and is waiting to be approved by the recipient',
        )
        .should('be.visible');
    });
  }
  isTransferPendingHeaders() {
    cy.contains('Cluster ownership transfer pending').should('be.visible');
    cy.get('p')
      .contains(
        'The cluster ownership transfer process will be completed after the new owner accepts the transfer. You can cancel this process at any time before the transfer is accepted. Actions on the cluster are disabled while the transfer is pending',
      )
      .should('be.visible');
  }
  isTransferFieldValidationShown(validationMessage) {
    cy.get('div[id="auto-transfer-cluster-ownership-modal"]').within(() => {
      cy.contains(validationMessage).should('be.exist');
    });
  }
  transferOwnershipUsernameInput = () => cy.get('input#username').should('be.visible');
  transferOwnershipAccountIDInput = () => cy.get('input#accountID').should('be.visible');
  transferOwnershipOrganizationIDInput = () => cy.get('input#orgID').should('be.visible');
  transferModelInitiateTransferButton = () => cy.getByTestId('btn-primary').should('be.visible');
  transferOwnershipTab = () => cy.get('button').contains('Transfer Ownership').should('be.visible');

  initiateTransferButton = () =>
    cy.get('button').contains('Initiate transfer').should('be.visible');
  initiateTransferButtonFromModel = () =>
    cy.get('footer').find('button').contains('Initiate transfer').should('be.visible');
  cancelButtonFromModel = () =>
    cy.get('footer').find('button').contains('Cancel').should('be.visible');

  cancelTransferButton = () => cy.get('button').contains('Cancel transfer').should('be.visible');
  cancelTransferButtonFromModel = () =>
    cy
      .get('footer')
      .find('button')
      .contains(/Cancel Transfer/i)
      .should('be.visible');
}
export default new TransferOwnershipPage();
