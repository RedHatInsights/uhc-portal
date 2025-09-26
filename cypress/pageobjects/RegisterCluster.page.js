import Page from './page';

class RegisterCluster extends Page {
  clusterIDInput = () => cy.get('input[name="cluster_id"]');

  displayNameInput = () => cy.get('input[name="display_name"]');

  clusterURLInput = () => cy.get('input[name="web_console_url"]');

  clusterIDError = () => cy.get('span[class*="helper-text"][class*="item-text"]');

  displayNameError = () => cy.get('div[id="display_name-helper"]');

  clusterURLError = () => cy.get('div[id="web_console_url-helper"]');

  cancelButton = () => cy.contains('button', 'Cancel');

  submitButton = () => cy.get('button[type="submit"]');
}

export default new RegisterCluster();
