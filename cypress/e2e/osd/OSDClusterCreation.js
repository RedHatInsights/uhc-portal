import ClusterListPage from '../../pageobjects/ClusterList.page';
import CreateClusterPage from '../../pageobjects/CreateCluster.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';
import GlobalNav from '../../pageobjects/GlobalNav.page';
import LeaveCreateClusterPrompt from '../../pageobjects/LeaveCreateClusterPrompt';
import { CLUSTER_LIST_PATH } from '../../support/routePaths';

const clusterName = `test-${Math.random().toString(36).substr(2, 10)}`;

describe('OSD cluster tests', { tags: ['ci'] }, () => {
  before(() => {
    cy.visit(CLUSTER_LIST_PATH);
    ClusterListPage.waitForDataReady();
    ClusterListPage.isClusterListScreen();
  });

  describe('Create OSD cluster on AWS flow', () => {
    it('navigates to create OSD cluster', () => {
      cy.getByTestId('create_cluster_btn').click();
      CreateClusterPage.isCreateClusterPage();
      CreateOSDWizardPage.osdCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it('shows an error with invalid and empty names', () => {
      CreateOSDWizardPage.isBillingModelScreen();
      // select Red Hat account cloud option (previously default value)
      cy.get(CreateOSDWizardPage.billingModelRedHatCloudAccountOption).click();
      cy.get(CreateOSDWizardPage.primaryButton).click();
      cy.getByTestId('aws-provider-card').click();
      cy.get(CreateOSDWizardPage.primaryButton).click();

      CreateOSDWizardPage.isClusterDetailsScreen();
      cy.get(CreateOSDWizardPage.clusterNameInput)
        .scrollIntoView()
        .type('aaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaa-aaaaaaaaaaaaaaaa-aaaaaaaa');
      cy.get(CreateOSDWizardPage.clusterNameInputError).contains('1 - 54 characters');
      cy.get(CreateOSDWizardPage.clusterNameInput).clear();
      cy.get(CreateOSDWizardPage.clusterNameInputError).should('have.length', 4);
      cy.get(CreateOSDWizardPage.clusterNameInput).clear().type('a*a');
      cy.get(CreateOSDWizardPage.clusterNameInputError).contains(
        'Consist of lower-case alphanumeric',
      );
      cy.get(CreateOSDWizardPage.clusterNameInput).clear().type('9a');
      cy.get(CreateOSDWizardPage.clusterNameInputError).contains(
        'Start with a lower-case alphabetic',
      );
      cy.get(CreateOSDWizardPage.clusterNameInput).clear().type('a*');
      cy.get(CreateOSDWizardPage.clusterNameInputError)
        .last()
        .contains('End with a lower-case alphanumeric');
    });

    it('fills OSD wizard but does not really create an OSD cluster', () => {
      cy.get(CreateOSDWizardPage.clusterNameInput).clear().type(clusterName);
      cy.get(CreateOSDWizardPage.clusterNameInputError).should('have.length', 0);

      // click "next" until the cluster is created :)
      cy.get(CreateOSDWizardPage.primaryButton).click();
      CreateOSDWizardPage.isMachinePoolScreen();
      cy.get('.spinner-loading-text').should('not.exist');
      cy.get(CreateOSDWizardPage.primaryButton).click();
      CreateOSDWizardPage.isNetworkingScreen();
      cy.get(CreateOSDWizardPage.primaryButton).click();
      CreateOSDWizardPage.isCIDRScreen();
      cy.get(CreateOSDWizardPage.primaryButton).click();
      CreateOSDWizardPage.isUpdatesScreen();
      cy.get(CreateOSDWizardPage.primaryButton).click();
      CreateOSDWizardPage.isReviewScreen();
    });
  });
});

describe('OSD Trial cluster tests', () => {
  describe('View Create OSD Trial cluster page', () => {
    it('navigates to create OSD Trial cluster and CCS is selected', () => {
      GlobalNav.breadcrumbItem('Cluster List').click({ force: true }); // need force=true to get past 'element detached from dom' error

      ClusterListPage.waitForDataReady();

      cy.getByTestId('create_cluster_btn').click();
      CreateClusterPage.isCreateClusterPage();
      cy.getByTestId('osd-create-trial-cluster').click({ force: true });
      CreateOSDWizardPage.isCreateOSDTrialPage();
      cy.get(CreateOSDWizardPage.CCSSelected).should('exist');
      cy.get(CreateOSDWizardPage.TrialSelected).should('exist');
    });
  });
});
