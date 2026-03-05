import Page from './page';
import { CLUSTER_LIST_FULL_PATH } from '../support/routePaths';

/**
 * sub page containing specific selectors and methods for a specific page
 */
class ClusterList extends Page {
  isClusterListUrl() {
    super.assertUrlIncludes(CLUSTER_LIST_FULL_PATH);
  }

  filterTxtField = () => cy.getByTestId('filterInputClusterList', { timeout: 15000 });

  viewOnlyMyCluster = () => cy.get('label > input[id="view-only-my-clusters"]');

  viewOnlyMyClusterHelp = () => cy.get('label[for="view-only-my-clusters"]').find('button').first();

  tooltipviewOnlyMyCluster = () => cy.get('div[role="dialog"][aria-modal="true"]');

  viewClusterArchives = () => cy.contains('a', 'View cluster archives');

  viewClusterRequests = () => cy.contains('a', 'View cluster requests');

  viewClusterRequestsButton = () => cy.contains('button', 'View cluster requests');

  assistedInstallerClusters = () => cy.contains('a', 'Assisted Installer clusters');

  registerCluster = () => cy.getByTestId('register-cluster-item');

  showActiveClusters = () => cy.get('a').contains('Show active clusters');

  clusterKebabIcon = () => cy.get('button[aria-label="Kebab toggle"]').should('be.visible');

  itemPerPage = () => cy.get('#options-menu-bottom-toggle').last();

  goToLastPageBtn = () => cy.get('button[aria-label="Go to last page"]').last();

  goToFirstPageBtn = () => cy.get('button[aria-label="Go to first page"]').last();

  typeColumnsInClusterList = () => cy.get('td[data-label="Type"] span');

  filterdClusterTypesValues = () => cy.getByTestId('cluster-type-filter-chip');

  createClusterButton = () => cy.getByTestId('create_cluster_btn');

  pendingTransferRequestsBanner = () => cy.get('#pendingTransferOwnerAlert', { timeout: 15000 });

  showPendingTransferRequestsLink = () => cy.get('a').contains('Show pending transfer requests');

  isRegisterClusterUrl() {
    super.assertUrlIncludes('/openshift/register');
  }

  isClusterListScreen() {
    cy.contains('h1, h4, button', /Cluster List|Let's create your first cluster/);
  }

  isRegisterClusterScreen() {
    cy.contains('h1', 'Register disconnected cluster');
  }

  isClusterArchivesScreen() {
    cy.contains('h1', 'Cluster Archives');
  }

  isClusterArchivesUrl() {
    super.assertUrlIncludes('/openshift/archived');
  }

  clusterListRefresh() {
    cy.get('button[aria-label="Refresh"]').scrollIntoView().click({ force: true });
  }

  clickClusterTypeFilters() {
    cy.get('button').contains('Cluster type').click();
  }

  clickClusterTypes(type) {
    cy.getByTestId(`cluster-type-${type}`).click();
  }

  // Checks if the selected filters are populated filter rule string in cluster/archives list.
  checkFilteredClusterTypes(type, isContains) {
    let criteria = 'eq';
    if (!isContains) {
      criteria = 'not.eq';
    }
    this.filterdClusterTypesValues().each(($elements) => {
      cy.wrap($elements).invoke('text').should(criteria, type);
    });
  }

  // Checks if the selected cluster type filters matches with the list of clusters filtered in list.
  checkFilteredClustersFromClusterList(type, isContains) {
    let criteria = 'eq';
    if (!isContains) {
      criteria = 'not.eq';
    }
    this.typeColumnsInClusterList().each(($elements) => {
      cy.wrap($elements).invoke('text').should(criteria, type);
    });
  }

  goToLastPage() {
    this.goToLastPageBtn().then(($btn) => {
      if ($btn.is(':enabled')) {
        cy.wrap($btn).click();
      }
    });
  }

  goToFirstPage() {
    this.goToFirstPageBtn().then(($btn) => {
      if ($btn.is(':enabled')) {
        cy.wrap($btn).click();
      }
    });
  }

  openClusterDefinition(clusterName) {
    cy.get('a')
      .contains(new RegExp(`^${clusterName}$`, 'g'), { timeout: 10000 })
      .click({ force: true });
  }

  clickKebabMenuItem(menuText) {
    cy.get('button').contains(menuText).click();
  }

  clickClusterListExtraActions() {
    cy.getByTestId('cluster-list-extra-actions-dropdown').should('be.visible').click();
  }

  clickClusterListExtraActions() {
    cy.get('button').should('be.visible').click();
  }

  clickClusterListTableHeader(header) {
    cy.get('th').contains(header, { timeout: 20000 }).should('be.visible').click();
  }

  scrollClusterListPageTo(direction) {
    cy.getByTestId('appDrawerContent').scrollTo(direction, { ensureScrollable: false });
  }

  scrollToPagination() {
    cy.get('#options-menu-bottom-pagination').scrollIntoView();
  }

  scrollToFilter() {
    cy.get('input[aria-label="Filter"]').scrollIntoView();
  }

  clickPerPageItem(count) {
    cy.get(`li[data-action="per-page-${count}"]`).scrollIntoView().click();
  }

  checkClusterListTableHeaders(headers) {
    headers.forEach((header) =>
      cy.get('table[aria-label="Cluster List"]').contains('th', header).should('be.visible'),
    );
  }

  searchForClusterWithStatus(status) {
    cy.contains('td[data-label="Status"]', status).siblings().get('td > div').first().click();
  }

  waitForDataReady() {
    cy.get('div[data-ready="true"]', { timeout: 60000 }).should('exist');
  }

  waitForClusterInClusterList(clusterName) {
    cy.getByTestId('clusterListTableBody').within(() => {
      cy.get('a').contains(clusterName, { timeout: 60000 }).should('exist');
      cy.get('span').contains('loading cluster status', { timeout: 60000 }).should('not.exist');
    });
  }

  clickClusterKebabIcon(clusterName) {
    cy.get(`a:contains(${clusterName})`)
      .parents('tr')
      .within(() => {
        cy.get('button[aria-label="Kebab toggle"]').click();
      });
  }

  waitForArchiveDataReady() {
    cy.get('div.cluster-list', { timeout: 30000 }).should('exist');
    cy.get('div.ins-c-spinner.cluster-list-spinner', { timeout: 30000 }).should('not.exist');
  }

  clearFilters() {
    cy.get('button', { timeout: 30000 }).contains('Clear filters').click({ force: true });
  }

  isCreateClusterBtnVisible() {
    cy.getByTestId('create_cluster_btn').should('be.visible');
  }

  isPendingTransferRequestsBannerShown(isShown, transferRequests) {
    if (isShown) {
      this.pendingTransferRequestsBanner()
        .should('be.visible')
        .within(() => {
          cy.get('h4').contains('Pending Transfer Requests').should('be.visible');
          cy.contains(`You have ${transferRequests} pending cluster transfer ownership request`);
          this.showPendingTransferRequestsLink()
            .invoke('attr', 'href')
            .should('include', '/openshift/./cluster-request');
        });
    } else {
      this.pendingTransferRequestsBanner().should('not.be.exist');
    }
  }

  checkForDetailsInAnchor() {
    cy.get('tr')
      .find('td[data-label="Name"] a')
      .should('have.length.greaterThan', 0)
      .each((anchor) => {
        expect(anchor.prop('href')).to.include('/openshift/details/');
      });
  }

  checkIfFirstAnchorNavigatesToCorrectRoute() {
    cy.get('tr')
      .find('td[data-label="Name"] a')
      .first()
      .then((anchor) => {
        const href = anchor.prop('href');
        cy.wrap(anchor).click();
        cy.url().should('include', '/openshift/details/');
        cy.url().should('include', href);
      });
  }
}

export default new ClusterList();
