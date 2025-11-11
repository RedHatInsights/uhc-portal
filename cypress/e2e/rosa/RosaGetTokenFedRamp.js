import Login from '../../pageobjects/login.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';

Cypress.config({
  defaultCommandTimeout: 120000,
  pageLoadTimeout: 120000,
  viewportWidth: 1600,
  viewportHeight: 1080,
});

describe('Write ROSA Login cmd to file', { tags: ['fedramp'] }, () => {
  it('Writes ROSA Login cmd to file', () => {
    cy.visit('../create/rosa/getstarted');
    cy.get('[role="status"]').should('not.exist');
    cy.get('[aria-label="Copyable ROSA login command"]').then(($elem) => {
      Cypress.env('TOKEN', $elem.val());
    });
  });
  it('prints ROSA Login cmd', () => {
    const newArr = Cypress.env('TOKEN').split('--token=');
    Cypress.env('TOKEN', newArr[1]);
    cy.writeFile(`${Cypress.config('projectRoot')}/rosa-login-token.sh`, Cypress.env('TOKEN'));
  });
});
