import Page from './page';

class Subscription extends Page {
  subscriptionLeftNavigationMenu = () => cy.get('li[data-quickstart-id="Subscriptions"]');

  annualSubscriptionLeftNavigationMenu = () => cy.get('a[data-quickstart-id="openshift_quota"]');

  planTypeHelpButton = () => cy.get('th').contains('Plan type').find('button');

  enableMarketplaceLink = () => cy.get('a').contains('Enable in Marketplace');

  learnMoreLink = () => cy.get('a').contains('Learn more');

  dedicatedOnDemandLink = () => cy.get('a').contains('Dedicated (On-Demand Limits)');

  isDedicatedAnnualPage() {
    cy.contains('h1', 'Annual Subscriptions (Managed)', { timeout: 20000 });
  }

  isDedicatedSectionHeader() {
    cy.contains('div', 'Annual Subscriptions');
  }

  isContainEmbeddedLink(text, link) {
    cy.contains('a', text).invoke('attr', 'href').should('include', link);
  }
  isDedicatedOnDemandSectionHeader() {
    cy.contains('div', 'OpenShift Dedicated');
  }

  isSubscriptionTableHeader() {
    cy.contains('div', 'Quota');
  }

  isDedicatedOnDemandPage() {
    cy.contains('h1', 'Dedicated (On-Demand Limits)', { timeout: 20000 });
  }

  checkQuotaTableColumns(columnName) {
    cy.get('th').contains(columnName).should('be.visible');
  }

  getQuotaTableRow(items) {
    return cy
      .get('td')
      .contains(new RegExp('^' + items.related_resources[0].resource_type + '$', 'g'));
  }

  patchCustomQuotaDefinition(data = []) {
    cy.intercept('**/quota_cost*', (req) => {
      req.continue((res) => {
        res.body = data;
        res.send(res.body);
      });
    });
  }
}
export default new Subscription();
