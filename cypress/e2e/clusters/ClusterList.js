import ClusterListPage from '../../pageobjects/ClusterList.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';

describe(
  'Check all cluster lists page items presence and its actions (OCP-21339)',
  { tags: ['smoke'] },
  () => {
    /* WARNING! The "/cluster-list" route is used by catchpoint tests which determine
    website operation status on 'http:///status.redhat.com'.  If this route is changed, 
    then the related catchpoint tests must be updated. For more info. see: https://issues.redhat.com/browse/OCMUI-2398 */
    before(() => {
      cy.visit('/cluster-list');
      ClusterListPage.waitForDataReady();
      ClusterListPage.isClusterListScreen();
    });

    it('Cluster list page : filters & its actions', () => {
      cy.get('body').then(($body) => {
        if (
          $body.find('h4:contains("Let\'s create your first cluster")').filter(':visible').length >
          0
        ) {
          ClusterListPage.registerCluster().should('be.visible');
          ClusterListPage.viewClusterArchives().should('be.visible');
          ClusterListPage.assistedInstallerClusters().should('be.visible');
        } else {
          ClusterListPage.filterTxtField().should('be.visible').click();
          ClusterListPage.filterTxtField().clear().type('smoke cluster');
          ClusterListPage.filterTxtField().clear();
          ClusterListPage.waitForDataReady();
          ClusterListPage.clickClusterTypeFilters();
          ClusterListPage.clickClusterTypes('OCP');
          ClusterListPage.clickClusterTypes('OSD');
          ClusterListPage.clickClusterTypes('ROSA');
          ClusterListPage.clickClusterTypes('ARO');
          ClusterListPage.clickClusterTypes('RHOIC');
          ClusterListPage.clickClusterTypes('OCP');
          ClusterListPage.clickClusterTypes('OSD');
          ClusterListPage.clickClusterTypes('ROSA');
          ClusterListPage.clickClusterTypes('ARO');
          ClusterListPage.clickClusterTypes('RHOIC');
          ClusterListPage.clickClusterTypeFilters();
          ClusterListPage.isCreateClusterBtnVisible();
          ClusterListPage.createClusterButton().click();
          CreateClusterPage.isCreateClusterPageHeaderVisible();
          cy.go('back');
        }
      });
    });
    it('Cluster list page : extra options & its actions', () => {
      ClusterListPage.viewClusterArchives().click();
      ClusterListPage.isClusterArchivesUrl();
      ClusterListPage.isClusterArchivesScreen();
      cy.go('back');
    });
    it('Cluster list page : view only cluster options & its actions', () => {
      ClusterListPage.viewOnlyMyCluster().click({ force: true });
      ClusterListPage.viewOnlyMyClusterHelp().click();
      ClusterListPage.tooltipviewOnlyMyCluster().contains(
        'Show only the clusters you previously created, or all clusters in your organization.',
      );
      ClusterListPage.clusterListRefresh();
    });
    it('Cluster list page : Register cluster & its actons', () => {
      ClusterListPage.registerCluster().should('be.visible').click();
      ClusterListPage.isRegisterClusterUrl();
      ClusterListPage.isRegisterClusterScreen();
      cy.go('back');
    });
    // WARNING! This test mimics the catchpoint test.  Please see comments above.
    it('[Catchpoint] Cluster list should contain at least on anchor with "/openshift/details/"', () => {
      ClusterListPage.checkForDetailsInAnchor();
    });
    it('Cluster list page: first anchor should navigate to details page', () => {
      ClusterListPage.checkIfFirstAnchorNavigatesToCorrectRoute();
    });
  },
);
