import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterRequestPage from '../../pageobjects/ClusterRequests.page';

describe(
  'Check  cluster requests page items presence and its actions(OCP-80154)',
  { tags: ['smoke'] },
  () => {
    before(() => {
      cy.visit('/cluster-list');
      ClusterListPage.waitForDataReady();
      ClusterListPage.isClusterListScreen();
    });

    it('Cluster requests links and page definitions', () => {
      ClusterListPage.viewClusterRequests().click();
      ClusterRequestPage.isClusterRequestsUrl();
      ClusterRequestPage.isClusterRequestsScreen();
      ClusterRequestPage.isClusterTranferRequestHeaderPage();
      ClusterRequestPage.isClusterTranferRequestContentPage(
        'Transfer cluster ownership so that another user in your organization or another organization can manage this cluster',
      );
      ClusterRequestPage.isClusterTranferRequestContentPage(
        'Cluster transfers from outside your organization will show numerous ‘Unknown’ fields, as access to external cluster data is restricted',
      );
    });
    it('Cluster requests table and page definitions', () => {
      cy.intercept('**/cluster_transfers?search*').as('clusterTransfers');
      cy.visit('/cluster-request');
      cy.wait('@clusterTransfers', { timeout: 20000 }).then((responseData) => {
        const statusCode = responseData.response.statusCode;
        if (statusCode === 204) {
          cy.contains('No cluster transfers found').should('be.visible');
          cy.contains(
            'There are no clusters for your user that are actively being transferred',
          ).should('be.visible');
        } else {
          ClusterRequestPage.checkClusterRequestsTableHeaders('Name');
          ClusterRequestPage.checkClusterRequestsTableHeaders('Status');
          ClusterRequestPage.checkClusterRequestsTableHeaders('Type');
          ClusterRequestPage.checkClusterRequestsTableHeaders('Version');
          ClusterRequestPage.checkClusterRequestsTableHeaders('Current Owner');
          ClusterRequestPage.checkClusterRequestsTableHeaders('Transfer Recipient');
        }
      });
    });
    it('Cluster requests page definition when empty cluster ownership requests', () => {
      cy.visit('/cluster-request');
      cy.intercept('**/cluster_transfers*', (req) => {
        req.continue((res) => {
          res.body = '{"items":[]}';
          res.send(res.body);
        });
      }).as('clusterRequests');
      cy.wait('@clusterRequests', { timeout: 20000 });
      cy.contains('No cluster transfers found').should('be.visible');
      cy.contains('There are no clusters for your user that are actively being transferred').should(
        'be.visible',
      );
    });

    it('Cluster requests link presence when empty clusters', () => {
      cy.visit('/cluster-list');
      cy.intercept('**/subscriptions*', (req) => {
        req.continue((res) => {
          res.body = '{"items":[],"kind":"SubscriptionList","page":1,"size":0,"total":0}';
          res.send(res.body);
        });
      }).as('subscriptions');
      cy.wait('@subscriptions', { timeout: 20000 }).its('response.statusCode').should('eq', 200);

      ClusterListPage.isClusterListScreen();
      ClusterListPage.viewClusterRequestsButton().should('be.visible').click();
      ClusterRequestPage.isClusterRequestsUrl();
      ClusterRequestPage.isClusterRequestsScreen();
    });
  },
);
