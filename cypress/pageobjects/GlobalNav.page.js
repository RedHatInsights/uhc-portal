import Page from './page';

class GlobalNav extends Page {
  globalNavigation = () => cy.get('button[aria-label="Global navigation"]');
  clustersNavigation = () => cy.get('a[data-quickstart-id="openshift"]');
  overviewNavigation = () => cy.get('a[data-quickstart-id="openshift_overview"]');
  releasesNavigation = () => cy.get('a[data-quickstart-id="openshift_releases"]');
  downloadsNavigation = () => cy.get('a[data-quickstart-id="openshift_downloads"]');
  subscriptionsNavigation = () => cy.get('li[data-quickstart-id="Subscriptions"]');
  subscriptionsAnnualNavigation = () => cy.get('a[data-quickstart-id="openshift_quota"]');
  subscriptionsOnDemandNavigation = () =>
    cy.get('a[data-quickstart-id="openshift_quota_resource-limits"]');

  closeSideBar(body) {
    if (!body.find('#chr-c-sidebar').is(':visible')) {
      cy.get('#nav-toggle').click();
    }
  }

  navigateTo(text) {
    cy.get('body').then(($body) => {
      this.closeSideBar($body);
      cy.get('[data-loading], [role="progressbar"], .skeleton').should('not.exist');
      cy.get('nav a, [role="navigation"] a').contains(text).click();
    });
  }

  closeSideBarNav() {
    cy.get('body').then(($body) => {
      this.closeSideBar($body);
    });
  }

  breadcrumbItem = (item) => cy.get('ol > li').contains(item);
}

export default new GlobalNav();
