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
      cy.get('.pf-v6-c-skeleton').should('not.exist');
      cy.contains('a.pf-v6-c-nav__link', text).click();
    });
  }

  closeSideBarNav() {
    cy.get('body').then(($body) => {
      this.closeSideBar($body);
    });
  }

  breadcrumbItem = (item) => cy.get('ol.pf-v6-c-breadcrumb__list > li').contains(item);
}

export default new GlobalNav();
