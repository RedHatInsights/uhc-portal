import Page from './page';

/**
 * sub page containing specific selectors and methods for a specific page
 */
class Downloads extends Page {
  filterByCategory = (category) => {
    cy.getByTestId('downloads-category-dropdown').select(category);
  };

  clickExpandAll = () => cy.contains('Expand all').click();

  clickCollapseAll = () => cy.contains('Collapse all').click();

  isDownloadsPage() {
    cy.contains('h1', 'Downloads');
  }

  pullSecretSection = () => cy.getByTestId('expandable-row-pull-secret');

  tokenSection = () => cy.getByTestId('downloads-section-TOKENS');

  downloadPullSecretButton = () => this.pullSecretSection().find('button').contains('Download');

  copyPullSecretButton = () => this.pullSecretSection().find('button').contains('Copy');

  isVisibleRowContaining = (substring) =>
    cy.contains(substring).parents('tr').invoke('attr', 'hidden').should('not.exist');

  isHiddenRowContaining = (substring) =>
    cy.contains(substring).parents('tr').invoke('attr', 'hidden').should('exist');

  rowDoesNotExist = (rowDataTestId) => cy.getByTestId(rowDataTestId).should('not.exist');

  clickExpandableRow = (substring) =>
    cy.contains(substring).parents('[role="rowgroup"]').find('button#expand-toggle0').click();

  allDropdownOptions = (dropdownDataTestId, testValues) => {
    cy.getByTestId(dropdownDataTestId)
      .children('option')
      .then((options) => {
        const actualValues = [...options].map((o) => o.text);
        expect(actualValues).to.eql(testValues);
      });
  };

  enabledDropdownOptions = (dropdownDataTestId, testValues) => {
    cy.getByTestId(dropdownDataTestId)
      .children('option:not([disabled])')
      .then((options) => {
        const actualValues = [...options].map((o) => o.text);
        expect(actualValues).to.eql(testValues);
      });
  };
}

export default new Downloads();
