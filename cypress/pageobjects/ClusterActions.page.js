import Page from './page';

class ClusterActionsPage extends Page {
  actionsDropdown = () => cy.get('button[data-testid="cluster-actions-dropdown"]');
  actionsDropdownItems = () => cy.get('div[data-testid="cluster-actions-dropdown"]');

  clickActionsMenuItem(menuText) {
    this.actionsDropdownItems().within(() => {
      cy.contains(menuText).click();
    });
  }
}
export default new ClusterActionsPage();
