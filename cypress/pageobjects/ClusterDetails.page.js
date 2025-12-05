import PropTypes from 'prop-types';
import Page from './page';
import { notAutoScalingAdditionalMachinePool } from '~/components/clusters/common/__tests__/totalNodesDataSelector.fixtures';

class ClusterDetails extends Page {
  isClusterDetailsPage = (displayName) =>
    cy.contains('.cl-details-page-title', displayName, { timeout: 10000 });

  addConsoleURLButton = () => cy.get('button').contains('Add console URL');

  openConsoleButton = () => cy.getByTestId('console-url-link').find('button').first();

  editConsoleURLDialogInput = () => cy.get('input[id="edit-console-url-input"]');

  clusterOwnerLink = () => cy.getByTestId('ownerTranswerOverviewLink');

  editConsoleURLDialogConfirm = () =>
    cy
      .get('div[aria-label="Add console URL"]')
      .find('footer')
      .find('button')
      .first()
      .contains('Add URL');

  openConsoleLink = () => cy.getByTestId('console-url-link');

  actionsDropdownToggle = () => cy.getByTestId('cluster-actions-dropdown');

  editDisplayNameDropdownItem = () => cy.contains('button', 'Edit display name');

  editMachinePoolDropdownItem = () => cy.contains('button', 'Edit Machine pool');

  editDisplayNameInput = () => cy.get('input[id="edit-display-name-input"]');

  overviewTab = () => cy.contains('button', 'Overview');

  accessControlTab = () => cy.contains('button', 'Access control');

  addonsTab = () => cy.contains('button', 'Add-ons');

  machinePoolsTab = () => cy.get('button[role="tab"]').contains(/machine.*pool|compute/i);

  supportTab = () => cy.contains('button', 'Support');

  networkingTab = () => cy.contains('button', 'Networking');

  settingsTab = () => cy.contains('button', 'Settings');

  accessRequestTab = () => cy.contains('button', 'Access requests');

  clusterHistoryTab = () => cy.get('button[id="pf-tab-4-Cluster history"]');

  editDisplaynameConfirm = () =>
    cy.get('div[aria-label="Edit display name"]').find('footer').find('button').first();

  archiveClusterDropdownItem = () => cy.contains('button', 'Archive cluster');

  archiveClusterDialogConfirm = () =>
    cy.get('div[aria-label="Archive cluster"]').find('footer').find('button').first();

  successNotification = () => cy.get('div.pf-m-success.notification-item');

  unarchiveClusterButton = () =>
    cy.get('[id="cl-details-btns"]').contains('button', 'Unarchive', { timeout: 15000 });

  waitForUnarchiveClusterModalToLoad = () => {
    cy.getByTestId(' unarchive-cluster-dialog', { timeout: 30000 }).should('be.visible');
    cy.contains('button', 'Unarchive cluster').should('be.visible');
  };

  unarchiveClusterDialogConfirm = () => cy.contains('button', 'Unarchive cluster');

  deleteClusterDropdownItem = () => cy.contains('button', 'Delete cluster');

  deleteClusterNameInput = () => cy.get('input[aria-label="cluster name"]');

  deleteClusterConfirm = () =>
    cy.get('div[aria-label="Delete cluster"]').find('footer').find('button').first();

  clusterNameTitle = () => cy.get('h1.cl-details-page-title');

  clusterTypeLabelValue = () => cy.getByTestId('clusterType').should('exist');

  clusterRegionLabelValue = () => cy.getByTestId('region').should('exist');

  clusterPersistentStorageLabelValue = () => cy.getByTestId('persistent-storage').should('exist');

  clusterLoadBalancersValue = () => cy.getByTestId('load-balancers').should('exist');

  clusterAvailabilityLabelValue = () => cy.getByTestId('availability').should('exist');

  clusterDomainPrefixLabelValue = () => cy.getByTestId('domainPrefix').should('exist');

  clusterAutoScalingStatus = () => cy.getByTestId('clusterAutoscalingStatus').should('exist');

  clusterIMDSValue = () => cy.getByTestId('instanceMetadataService').should('exist');

  clusterAuthenticationTypeLabelValue = () => cy.getByTestId('authenticationType').should('exist');

  clusterWifConfigurationValue = () => cy.getByTestId('wifConfiguration').should('exist');

  clusterFipsCryptographyStatus = () => cy.getByTestId('fipsCryptographyStatus').should('exist');

  clusterAdditionalEncryptionStatus = () => cy.getByTestId('etcEncryptionStatus').should('exist');

  clusterInfrastructureAWSaccountLabelValue = () =>
    cy.getByTestId('infrastructureAWSAccount').should('exist');

  clusterMachineCIDRLabelValue = () => cy.getByTestId('machineCIDR').should('exist');

  clusterServiceCIDRLabelValue = () => cy.getByTestId('serviceCIDR').should('exist');

  clusterPodCIDRLabelValue = () => cy.getByTestId('podCIDR').should('exist');

  clusterComputeNodeCountValue = () => cy.getByTestId('computeNodeCount').should('exist');

  clusterAutoScalingStatusValue = () => cy.getByTestId('clusterAutoscalingStatus');

  clusterHostPrefixLabelValue = () => cy.getByTestId('hostPrefix').should('exist');

  clusterMachinePoolTable = () => cy.get('table[aria-label="Machine pools"]');

  editSubscriptionSettingsLink = () => cy.get('button').contains('Edit subscription settings');

  serviceLevelAgreementValue = () => cy.getByTestId('service-level-agreement');

  supportTypeValue = () => cy.getByTestId('support-type');

  subscriptionTypeValue = () => cy.getByTestId('subscription-type');

  serviceLevelAgreementValue = () => cy.getByTestId('service-level-agreement');

  clusterUsageValue = () => cy.getByTestId('cluster-usage');

  subscriptionUnitsValue = () => cy.getByTestId('subscription-units');

  coresOrSocketsValue = () => cy.getByTestId('cores-or-sockets');

  serviceLevelAgreementPremiumRadio = () => cy.get('input[value="Premium"]');

  serviceLevelAgreementStandardRadio = () => cy.get('input[value="Standard"]');

  serviceLevelAgreementSelfSupportRadio = () => cy.get('input[value="Self-Support"]');

  supportTypeRedHatSupportL1L3Radio = () => cy.get('input[id="service_level:L1-L3"]');

  supportTypePartnerSupportL3Radio = () => cy.get('input[id="service_level:L3-only"]');

  clusterUsageProductionRadio = () => cy.get('input[value="Production"]');

  clusterUsageDevelopmentTestRadio = () => cy.get('input[value="Development/Test"]');

  clusterUsageDisasterRecoveryRadio = () => cy.get('input[value="Disaster Recovery"]');

  subscriptionUnitsCoreCpusRadio = () => cy.get('input[value="Core/vCPU"]');

  subscriptionUnitsSocketsRadio = () => cy.get('input[value="Sockets"]');

  deleteProtectionToggleButton = () => {
    return cy.getByTestId('delete-protection-toggle');
  };

  deleteProtectionStatus = () => {
    return cy.contains('dt', 'Delete Protection').next('dd');
  };

  deleteProtectionModal = () => cy.get('div[role="dialog"]');

  modalConfirmButton = () => {
    return this.deleteProtectionModal().find('button[data-testid="btn-primary"]');
  };

  modalCancelButton = () => {
    return this.deleteProtectionModal().find('button[data-testid="btn-secondary"]');
  };

  enableDeletionProtection() {
    cy.wait(10000);
    this.deleteProtectionToggleButton().scrollIntoView().click({ force: true });
    this.modalConfirmButton().should('contain.text', 'Enable').click();
    this.deleteProtectionModal().should('not.exist');
    this.deleteProtectionStatus().should('contain.text', 'Enabled');
  }

  disableDeletionProtection() {
    cy.wait(10000);
    this.deleteProtectionToggleButton().scrollIntoView().click({ force: true });
    this.modalConfirmButton().should('contain.text', 'Disable').click();
    this.deleteProtectionModal().should('not.exist');
    this.deleteProtectionStatus().should('contain.text', 'Disabled');
  }

  deleteClusterMenuItem = () => {
    return cy.contains('span', 'Delete cluster').closest('button[role="menuitem"]');
  };

  verifyDeleteOptionIsEnabled(shouldBeEnabled = true) {
    this.actionButton().click();

    if (shouldBeEnabled) {
      this.deleteClusterMenuItem().should('not.have.attr', 'aria-disabled');
    } else {
      this.deleteClusterMenuItem().should('have.attr', 'aria-disabled');
    }

    this.actionButton().click();
  }

  numberOfSocketsInput = () => cy.get('input[name="socket_total"]');

  numberOfCPUsInput = () => cy.get('input[name="cpu_total"]');

  saveSubscriptionButton = () => cy.getByTestId('btn-primary');

  actionButton = () => cy.getByTestId('cluster-actions-dropdown').first();

  editDisplayNameButton = () => cy.get('button').contains('Edit display name');

  editDisplayNameInput = () => cy.get('#edit-display-name-input');

  editButton = () => cy.get('button').contains('Edit');

  clusterOwnerLink = () => cy.getByTestId('ownerTranswerOverviewLink');

  clusterInfrastructureBillingModelValue = () =>
    cy.getByTestId('infrastructure-billing-model').find('div');

  clusterSubscriptionBillingModelValue = () =>
    cy.getByTestId('subscription-billing-model').find('div');

  clusterTotalvCPUValue = () => cy.getByTestId('total-vcpu');

  clusterTotalMemoryValue = () => cy.getByTestId('total-memory');

  clusterSecureBootSupportForShieldedVMsValue = () =>
    cy.getByTestId('secureBootSupportForShieldedVMs');

  clusterInstallationHeader = () => cy.getByTestId('installation-header');

  clusterInstallationExpectedText = () => cy.getByTestId('expected-cluster-installation-msg');

  clusterBillingMarketplaceAccountLabelValue = (expectedAccountId) => {
    return cy
      .getByTestId('billingMarketplaceAccountLink', { timeout: 30000 })
      .should('exist', expectedAccountId);
  };

  clusterControlPlaneTypeLabelValue = () => cy.getByTestId('controlPlaneType').should('exist');

  downloadOcCliLink = () => cy.getByTestId('download-oc-cli');

  waitForEditUrlModalToLoad = () => {
    cy.getByTestId('edit-console-url-dialog', { timeout: 30000 }).should('be.visible');
    cy.get('input[id="edit-console-url-input"]', { timeout: 30000 }).should('be.visible');
  };

  clusterDetailsPageRefresh() {
    cy.get('button[aria-label="Refresh"]').click();
  }

  getMachinePoolName(index = 1) {
    return this.clusterMachinePoolTable()
      .find('tr')
      .eq(index)
      .find('td[data-label="Machine pool"]');
  }

  getMachinePoolInstanceType(index) {
    return this.clusterMachinePoolTable()
      .find('tr')
      .eq(index)
      .find('td[data-label="Instance type"]');
  }

  showBillingMarketplaceAccountLink() {
    cy.getByTestId('billingMarketplaceAccountLink').click({ force: true });
  }

  refreshBillingAWSAccountButton() {
    cy.get('button[data-testid="refresh-aws-accounts"]');
  }

  clickAWSBillingAccountsDropDown() {
    cy.get('#edit-billing-aws-account-modal').within(() => {
      cy.get('button[aria-label="Options menu"]')
        .should('be.enabled', { timeout: 30000 })
        .click({ force: true });
    });
  }

  updateAWSBillingAccount() {
    cy.getByTestId(`Update`).click({ force: true });
  }

  verifyBillingAccountDocLink(text) {
    // Find the link that contains the text (even if text is in a nested span)
    cy.contains('a', text).should('have.attr', 'href', 'https://console.aws.amazon.com/rosa/home');
  }

  filterAWSBillingAccount(awsBillingAccount) {
    cy.get('input[placeholder*="Filter by account ID"]', { timeout: 50000 })
      .clear()
      .type(awsBillingAccount);
  }

  selectAWSBillingAccount(awsBillingAccount) {
    cy.get('div[aria-describedby="aws-infra-accounts"]').within(() => {
      cy.contains('button', awsBillingAccount).click({ force: true });
    });
  }

  showEditAWSBillingAccountModal() {
    cy.get('div[id="edit-billing-aws-account-modal"]').click();
  }

  getMachinePoolAvailabilityZones(index) {
    return this.clusterMachinePoolTable()
      .find('tr')
      .eq(index)
      .find('td[data-label="Availability zones"]');
  }

  getMachinePoolNodeCount(index) {
    return this.clusterMachinePoolTable().find('tr').eq(index).find('td[data-label="Node count"]');
  }
  getMachinePoolNodeAutoscaling(index) {
    return this.clusterMachinePoolTable().find('tr').eq(index).find('td[data-label="Autoscaling"]');
  }

  waitForEditUrlModalToClear = () => {
    cy.getByTestId('edit-console-url-dialog', { timeout: 30000 }).should('not.exist');
  };

  waitForEditDisplayNamelModalToLoad = () => {
    cy.getByTestId('edit-displayname-modal', { timeout: 30000 }).should('be.visible');
    cy.get('input[id="edit-display-name-input"]', { timeout: 30000 }).should('exist');
  };

  waitForEditDisplayNameModalToClear = () => {
    cy.getByTestId('edit-displayname-modal', { timeout: 30000 }).should('not.exist');
  };

  waitForDisplayNameChange = (displayName) => {
    cy.get('h1.cl-details-page-title', { timeout: 30000 }).should('not.have.text', displayName);
  };

  waitForArchiveClusterModalToLoad = () => {
    cy.getByTestId('archive-cluster-dialog', { timeout: 30000 }).should('be.visible');
    cy.contains('button', 'Archive cluster', { timeout: 30000 }).should('exist');
  };

  waitForClusterDetailsLoad = () => {
    cy.get('div.ins-c-spinner.cluster-details-spinner', { timeout: 30000 }).should('not.exist');
  };

  isEditMachinePoolDialogOpened() {
    cy.get('h1').contains('Edit machine pool').should('be.visible');
  }

  waitForAccountSetupToSuccess() {
    cy.get('li[id="awsAccountSetup"]', { timeout: 80000 }).should('have.class', 'pf-m-success');
    this.checkInstallationStepStatus('Account setup', 'Completed');
  }

  waitForOidcAndOperatorRolesSetupToSuccess() {
    cy.get('li[id="oidcAndOperatorRolesSetup"]', { timeout: 80000 }).should(
      'have.class',
      'pf-m-success',
    );
    this.checkInstallationStepStatus('OIDC and operator roles', 'Completed');
  }

  waitForDNSSetupToSuccess() {
    cy.get('li[id="DNSSetup"]', { timeout: 80000 }).should('have.class', 'pf-m-success');
    this.checkInstallationStepStatus('DNS setup', 'Completed');
  }

  waitForClusterInstallationToSuccess() {
    cy.get('li[id="clusterInstallation"]', { timeout: 80000 }).should('have.class', 'pf-m-success');
    this.checkInstallationStepStatus('Cluster installation', 'Completed');
  }

  checkInstallationStepStatus(step, status = '') {
    // Enhanced installation step status check without specific PF class dependencies
    let installStep = cy.contains('div', step, { timeout: 80000 }).filter('[id$="-title"]');
    if (status == '') {
      installStep.should('be.visible');
    } else {
      installStep.parent().within(() => {
        cy.contains('div', status).should('be.visible');
      });
    }
  }

  waitForInstallerScreenToLoad = () => {
    // Wait for the cluster details page to load by checking for positive indicators
    cy.get('h1, h2', { timeout: 100000 }).should('be.visible');
    cy.url({ timeout: 50000 }).should('include', '/details/');
  };

  waitForDeleteClusterActionComplete = () => {
    cy.getByTestId('delete-cluster-dialog')
      .get('div.ins-c-spinner', { timeout: 100000 })
      .should('not.exist');
  };
}

ClusterDetails.propTypes = {
  displayName: PropTypes.string.isRequired,
};

export default new ClusterDetails();
