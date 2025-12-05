import Page from './page';

class CreateOSDCluster extends Page {
  isCreateOSDPage() {
    super.assertUrlIncludes('/openshift/create/osd');
  }

  isCreateOSDTrialPage() {
    super.assertUrlIncludes('trial=osd');
  }

  isBillingModelScreen() {
    cy.contains('h2', 'Welcome to Red Hat OpenShift Dedicated', { timeout: 40000 });
  }

  isCloudProviderSelectionScreen() {
    cy.contains('h3', 'Select a cloud provider');
  }

  isOnlyGCPCloudProviderSelectionScreen() {
    cy.contains('h3', 'Google Cloud account details')
      .scrollIntoView()
      .should('exist')
      .should('be.visible');
    cy.contains('h3', 'Select a cloud provider').should('not.exist');
  }

  isPrerequisitesHintPresent() {
    cy.contains('strong', 'Have you prepared your Google account?')
      .scrollIntoView()
      .should('exist')
      .should('be.visible');
    cy.contains(
      "To prepare your account, accept the Google Cloud Terms and Agreements. If you've already accepted the terms, you can continue to complete OSD prerequisites.",
    )
      .scrollIntoView()
      .should('exist')
      .should('be.visible');
    cy.contains('a', 'Review Google terms and agreements')
      .scrollIntoView()
      .should('exist')
      .should('be.visible')
      .should(
        'have.attr',
        'href',
        'https://console.cloud.google.com/marketplace/agreements/redhat-marketplace/red-hat-openshift-dedicated',
      );
  }

  isWIFRecommendationAlertPresent() {
    cy.get('h4')
      .contains('Red Hat recommends using WIF as the authentication type')
      .should('exist')
      .should('be.visible');
  }

  isClusterDetailsScreen() {
    // Inline snippet to avoid flaky behavior around cluster version dropdown.
    this.clusterVersionPane()
      .scrollIntoView()
      .within(() => {
        cy.get('button[id="version-selector"]', { timeout: 40000 }).should('be.visible');
      });
    cy.contains('h3', 'Cluster details');
  }

  isMachinePoolScreen() {
    cy.get('button[aria-label="Machine type select toggle"]', { timeout: 40000 })
      .should('exist')
      .scrollIntoView()
      .should('be.visible');
    cy.contains('h3', 'Default machine pool');
  }

  isVPCSubnetScreen() {
    cy.contains('h3', 'Virtual Private Cloud (VPC) subnet settings');
  }

  isClusterWideProxyScreen() {
    cy.contains('h3', 'Cluster-wide proxy');
  }

  isNetworkingScreen() {
    cy.contains('h3', 'Networking configuration');
  }
  isCIDRScreen() {
    cy.contains('h3', 'CIDR ranges');
  }

  isUpdatesScreen() {
    cy.contains('h3', 'Cluster update strategy');
  }

  isReviewScreen() {
    cy.contains('h2', 'Review your dedicated cluster');
  }

  showsFakeClusterBanner = () =>
    cy.contains('div', 'On submit, a fake OSD cluster will be created.');

  osdCreateClusterButton = () =>
    cy
      .get('a[data-testid="osd-create-cluster-button"]', { timeout: 50000 })
      .should('not.have.class', 'pf-m-aria-disabled');

  osdTrialCreateClusterButton = () =>
    cy
      .get('a[data-testid="osd-create-trial-cluster"]', { timeout: 20000 })
      .should('not.have.class', 'pf-m-aria-disabled');

  subscriptionTypeFreeTrialRadio = () =>
    cy.get('input[name="billing_model"][value="standard-trial"]');

  subscriptionTypeAnnualFixedCapacityRadio = () =>
    cy.get('input[name="billing_model"][value="standard"]');

  subscriptionTypeOnDemandFlexibleRadio = () =>
    cy.get('input[name="billing_model"][value="marketplace-gcp"]');

  infrastructureTypeRedHatCloudAccountRadio = () =>
    cy.get('input[id="form-radiobutton-byoc-false-field"]');

  infrastructureTypeClusterCloudSubscriptionRadio = () =>
    cy.get('input[id="form-radiobutton-byoc-true-field"]', { timeout: 10000 });

  awsCloudProviderCard = () => cy.getByTestId('aws-provider-card');

  gcpWIFCommandInput = () => cy.getByTestId('gcp-wif-command').find('input');

  awsAccountIDInput = () => cy.get('input[id="account_id"]');

  awsAccessKeyInput = () => cy.get('input[id="access_key_id"]');

  awsSecretKeyInput = () => cy.get('input[id="secret_access_key"]');

  gcpCloudProviderCard = () => cy.getByTestId('gcp-provider-card');

  workloadIdentityFederationButton = () => cy.get('button[id="workloadIdentityFederation"]');

  serviceAccountButton = () => cy.get('button[id="serviceAccounts"]');

  clusterDetailsTree = () => cy.get('button[id="cluster-settings-details"]').contains('Details');

  acknowledgePrerequisitesCheckbox = () => cy.get('input[id="acknowledge_prerequisites"]');

  createCustomDomainPrefixCheckbox = () => cy.get('input[id="has_domain_prefix"]');

  domainPrefixInput = () => cy.get('input[name="domain_prefix"]');

  clusterVersionPane = () => cy.get('div[name="cluster_version"]');

  singleZoneAvailabilityRadio = () => cy.get('input[id="form-radiobutton-multi_az-false-field"]');

  multiZoneAvilabilityRadio = () => cy.get('input[id="form-radiobutton-multi_az-true-field"]');

  enableSecureBootSupportForShieldedVMsCheckbox = () => cy.get('input[id="secure_boot"]');

  advancedEncryptionLink = () => cy.contains('Advanced Encryption');

  enableAdditionalEtcdEncryptionCheckbox = () => cy.get('input[id="etcd_encryption"]');

  enableUserWorkloadMonitoringCheckbox = () =>
    cy.get('input[id="enable_user_workload_monitoring"]');

  enableAutoscalingCheckbox = () => cy.get('input[id="autoscalingEnabled"]');

  enableFIPSCryptographyCheckbox = () => cy.get('input[id="fips"]');

  computeNodeCountSelect = () => cy.get('input[aria-label="Compute nodes"]');

  computeNodeCountDetailsText = () => cy.getByTestId('compute-node-multizone-details');

  clusterPrivacyPublicRadio = () =>
    cy.get('input[id="form-radiobutton-cluster_privacy-external-field"]');

  clusterPrivacyPrivateRadio = () =>
    cy.get('input[id="form-radiobutton-cluster_privacy-internal-field"]');

  updateStrategyIndividualRadio = () =>
    cy.get('input[id="form-radiobutton-upgrade_policy-manual-field"]');

  updateStrategyRecurringRadio = () =>
    cy.get('input[id="form-radiobutton-upgrade_policy-automatic-field"]');

  machineCIDRInput = () => cy.get('input[id="network_machine_cidr"]');

  serviceCIDRInput = () => cy.get('input[id="network_service_cidr"]');

  podCIDRInput = () => cy.get('input[id="network_pod_cidr"]');

  hostPrefixInput = () => cy.get('input[id="network_host_prefix"]');

  cidrDefaultValuesCheckBox = () => cy.get('input[id="cidr_default_values_enabled"]');

  subscriptionTypeValue = () => cy.getByTestId('Subscription-type').find('div');

  infrastructureTypeValue = () => cy.getByTestId('Infrastructure-type').find('div');

  cloudProviderValue = () => cy.getByTestId('Cloud-provider').find('div');

  clusterNameValue = () => cy.getByTestId('Cluster-name').find('div');

  versionValue = () => cy.getByTestId('Version').find('div');

  regionValue = () => cy.getByTestId('Region').find('div');

  securebootSupportForShieldedVMsValue = () =>
    cy.getByTestId('Secure-Boot-support-for-Shielded-VMs').find('div');

  availabilityValue = () => cy.getByTestId('Availability').find('div');

  authenticationTypeValue = () => cy.getByTestId('Authentication-type').find('div');

  wifConfigurationValue = () => cy.getByTestId('WIF-configuration').find('div');

  clusterDomainPrefixLabelValue = () => cy.getByTestId('Domain-prefix').should('exist');

  userWorkloadMonitoringValue = () => cy.getByTestId('User-workload-monitoring').find('div');

  advancedEncryptionLink = () => cy.get('span').contains('Advanced Encryption');

  additionalSecurityGroupsLink = () => cy.get('button').contains('Additional security groups');

  useCustomKMSKeyRadio = () =>
    cy.get('input[id="form-radiobutton-customer_managed_key-true-field"]');

  keyArnInput = () => cy.get('span input[id="kms_key_arn"]');

  useDefaultKMSKeyRadio = () =>
    cy.get('input[id="form-radiobutton-customer_managed_key-false-field"]');

  persistentStorageValue = () => cy.getByTestId('Persistent-storage').find('div');

  encryptVolumesWithCustomerkeysValue = () =>
    cy.getByTestId('Encrypt-volumes-with-customer-keys').find('div');

  useBothIMDSv1AndIMDSv2Radio = () => cy.getByTestId('imds-optional');

  useIMDSv2Radio = () => cy.getByTestId('imds-required');

  additionalEtcdEncryptionValue = () => cy.getByTestId('Additional-etcd-encryption').find('div');

  fipsCryptographyValue = () => cy.getByTestId('FIPS-cryptography').find('div');

  nodeInstanceTypeValue = () => cy.getByTestId('Node-instance-type').find('div');

  autoscalingValue = () => cy.getByTestId('Autoscaling').find('div');

  computeNodeCountValue = () => cy.getByTestId('Compute-node-count').find('div');

  computeNodeRangeValue = () => cy.getByTestId('Compute-node-range').find('div');

  nodeLabelsValue = () => cy.getByTestId('Node-labels').find('span');

  clusterPrivacyValue = () => cy.getByTestId('Cluster-privacy').find('div');

  machineCIDRValue = () => cy.getByTestId('Machine-CIDR').find('div');

  serviceCIDRValue = () => cy.getByTestId('Service-CIDR').find('div');

  podCIDRValue = () => cy.getByTestId('Pod-CIDR').find('div');

  hostPrefixValue = () => cy.getByTestId('Host-prefix').find('div');

  installIntoExistingVpcValue = () => cy.getByTestId('Install-into-existing-VPC').find('div');

  privateServiceConnectValue = () => cy.getByTestId('Private-service-connect').find('div');

  applicationIngressValue = () => cy.getByTestId('Application-ingress').find('div');

  routeSelectorsValue = () => cy.getByTestId('Route-selectors').find('div');

  excludedNamespacesValue = () => cy.getByTestId('Excluded-namespaces').find('div');

  wildcardPolicyValue = () => cy.getByTestId('Wildcard-policy').find('div');

  namespaceOwnershipValue = () => cy.getByTestId('Namespace-ownership-policy').find('div');

  vpcSubnetSettingsValue = () => cy.getByTestId('VPC-subnet-settings').find('div');

  updateStratergyValue = () => cy.getByTestId('Update-strategy').find('div');

  nodeDrainingValue = () => cy.getByTestId('Node-draining').find('div');

  createClusterButton = () => cy.get('button').contains('Create cluster');

  minimumNodeInput = () => cy.get('input[aria-label="Minimum nodes"]');

  maximumNodeInput = () => cy.get('input[aria-label="Maximum nodes"]');

  minimumNodeCountMinusButton = () => cy.get('button[aria-label="Minimum nodes minus"]');

  minimumNodeCountPlusButton = () => cy.get('button[aria-label="Minimum nodes plus"]');

  maximumNodeCountMinusButton = () => cy.get('button[aria-label="Maximum nodes minus"]');

  maximumNodeCountPlusButton = () => cy.get('button[aria-label="Maximum nodes plus"]');

  popOverCloseButton = () => cy.get('button[aria-label="Close"]').filter(':visible');

  wizardCreateClusterButton = () => cy.getByTestId('rosa-create-cluster-button');

  rootDiskSizeInput = () => cy.get('input[name="worker_volume_size_gib"]');

  editClusterAutoscalingSettingsButton = () =>
    cy.getByTestId('set-cluster-autoscaling-btn', { timeout: 80000 });

  clusterAutoscalingLogVerbosityInput = () =>
    cy.get('input[id="cluster_autoscaling.log_verbosity"]');

  clusterAutoscalingMaxNodeProvisionTimeInput = () =>
    cy.get('input[id="cluster_autoscaling.max_node_provision_time"]');

  clusterAutoscalingBalancingIgnoredLabelsInput = () =>
    cy.get('input[id="cluster_autoscaling.balancing_ignored_labels"]');

  clusterAutoscalingCoresTotalMinInput = () =>
    cy.get('input[id="cluster_autoscaling.resource_limits.cores.min"]');

  clusterAutoscalingCoresTotalMaxInput = () =>
    cy.get('input[id="cluster_autoscaling.resource_limits.cores.max"]');

  clusterAutoscalingMemoryTotalMinInput = () =>
    cy.get('input[id="cluster_autoscaling.resource_limits.memory.min"]');

  clusterAutoscalingMemoryTotalMaxInput = () =>
    cy.get('input[id="cluster_autoscaling.resource_limits.memory.max"]');

  clusterAutoscalingMaxNodesTotalInput = () =>
    cy.get('input[id="cluster_autoscaling.resource_limits.max_nodes_total"]');

  clusterAutoscalingGPUsInput = () =>
    cy.get('input[id="cluster_autoscaling.resource_limits.gpus"]');

  clusterAutoscalingScaleDownUtilizationThresholdInput = () =>
    cy.get('input[id="cluster_autoscaling.scale_down.utilization_threshold"]');

  clusterAutoscalingScaleDownUnneededTimeInput = () =>
    cy.get('input[id="cluster_autoscaling.scale_down.unneeded_time"]');

  clusterAutoscalingScaleDownDelayAfterAddInput = () =>
    cy.get('input[id="cluster_autoscaling.scale_down.delay_after_add"]');

  clusterAutoscalingScaleDownDelayAfterDeleteInput = () =>
    cy.get('input[id="cluster_autoscaling.scale_down.delay_after_delete"]');

  clusterAutoscalingScaleDownDelayAfterFailureInput = () =>
    cy.get('input[id="cluster_autoscaling.scale_down.delay_after_failure"]');

  clusterAutoscalingRevertAllToDefaultsButton = () =>
    cy.get('button').contains('Revert all to defaults');

  clusterAutoscalingCloseButton = () => cy.get('button').contains('Close');

  addNodeLabelLink = () => cy.get('span').contains('Add node labels');

  installIntoExistingVpcCheckBox = () => cy.get('input[id="install_to_vpc"]');

  usePrivateServiceConnectCheckBox = () => cy.get('input[id="private_service_connect"]');

  applicationIngressDefaultSettingsRadio = () =>
    cy.get('input[id="form-radiobutton-applicationIngress-default-field"]');

  applicationIngressCustomSettingsRadio = () =>
    cy.get('input[id="form-radiobutton-applicationIngress-custom-field"]');

  applicationIngressRouterSelectorsInput = () => cy.get('input[name="defaultRouterSelectors"]');

  applicationIngressExcludedNamespacesInput = () =>
    cy.get('input[name="defaultRouterExcludedNamespacesFlag"]');

  applicationIngressNamespaceOwnershipPolicyRadio = () =>
    cy.get('input[id="isDefaultRouterNamespaceOwnershipPolicyStrict"]');

  applicationIngressWildcardPolicyDisallowedRadio = () =>
    cy.get('input[id="isDefaultRouterWildcardPolicyAllowed"]');

  applySameSecurityGroupsToAllNodeTypes = () =>
    cy.get('input[name="securityGroups.applyControlPlaneToAll"]');

  selectRegion(region) {
    cy.get('select[name="region"]').select(region);
  }

  wizardNextButton = () => cy.getByTestId('wizard-next-button');

  wizardBackButton = () => cy.getByTestId('wizard-back-button');

  wizardCancelButton = () => cy.getByTestId('wizard-cancel-button');

  get clusterNameInput() {
    return 'input[name="name"]';
  }

  get clusterNameInputError() {
    return '[role="list"] li[class*="error"]';
  }

  get primaryButton() {
    return '#osd-wizard button.pf-m-primary';
  }

  get CCSSelected() {
    return 'input:checked[name="byoc"][value="true"]';
  }

  get TrialSelected() {
    return 'input:checked[name="billing_model"][value="standard-trial"]';
  }

  get billingModelRedHatCloudAccountOption() {
    return 'input[id="form-radiobutton-byoc-false-field"]';
  }

  waitForVPCRefresh() {
    cy.getByTestId('refresh-vpcs').should('be.disabled');
    cy.get('span[role="progressbar"], .spinner', { timeout: 80000 }).should('not.exist');
  }

  selectVersion(version) {
    cy.get('button[id="version-selector"]').click();
    if (version === '') {
      cy.get('button[id^="openshift-"]').first().click();
    } else {
      cy.get('button').contains(version).click();
    }
  }

  selectVPC(vpcName) {
    cy.getByTestId('refresh-vpcs').should('be.enabled');
    cy.get('div button[id="selected_vpc"]').click({ force: true });
    cy.get(`div:contains('Select a VPC')`).should('be.visible');
    cy.get('input[placeholder="Filter by VPC ID / name"]', { timeout: 50000 })
      .clear()
      .type(vpcName);
    cy.contains(vpcName).scrollIntoView().click();
  }
  selectGcpVPC(vpcName) {
    cy.get('select[aria-label="Existing VPC name"]').select(vpcName);
  }

  selectControlPlaneSubnetName(subnetName) {
    cy.get('select[aria-label="Control plane subnet name"]').select(subnetName);
  }

  selectComputeSubnetName(subnetName) {
    cy.get('select[aria-label="Compute subnet name"]').select(subnetName);
  }

  selectPrivateServiceConnectSubnetName(pscName) {
    cy.get('select[aria-label="Private Service Connect subnet name"]').select(pscName);
  }
  selectKeylocation(location) {
    cy.get('select[aria-label="KMS location"]').select(location);
  }

  selectKeyRing(keyring) {
    cy.get('select[aria-label="Key ring"]').select(keyring);
  }

  selectKeyName(keyname) {
    cy.get('select[aria-label="Key name"]').select(keyname);
  }

  selectPrivateSubnet(index = 0, privateSubnetNameOrId) {
    cy.get(`button[id="machinePoolsSubnets[${index}].privateSubnetId"]`).click();
    cy.get('input[placeholder="Filter by subnet ID / name"]', { timeout: 50000 })
      .clear()
      .type(privateSubnetNameOrId);
    cy.get('li').contains(privateSubnetNameOrId).scrollIntoView().click();
    index = index + 1;
  }

  selectPublicSubnet(index = 0, publicSubnetNameOrId) {
    cy.get(`button[id="machinePoolsSubnets[${index}].publicSubnetId"]`).click();
    cy.get('input[placeholder="Filter by subnet ID / name"]', { timeout: 50000 })
      .clear()
      .type(publicSubnetNameOrId);
    cy.contains(publicSubnetNameOrId).scrollIntoView().click();
    index = index + 1;
  }
  selectSubnetAvailabilityZone(subnetAvailability) {
    cy.contains('Select availability zone').first().click();
    cy.get('ul[role="listbox"][aria-label').within(() => {
      cy.contains('li button', subnetAvailability).click({ force: true });
    });
  }

  selectApplySameSecurityGroupsToAllControlPlanesCheckbox(value = true) {
    if (value) {
      this.applySameSecurityGroupsToAllNodeTypes().check({ force: true });
    } else {
      this.applySameSecurityGroupsToAllNodeTypes().uncheck({ force: true });
    }
  }

  selectAdditionalSecurityGroups(securityGroups) {
    cy.get('button').contains('Select security groups').click({ force: true });
    //cy.get('div').find('button').contains('Select security groups').click({ force: true });
    cy.getByTestId('securitygroups-id').contains(securityGroups).click({ force: true });
    cy.get('button').contains('Select security groups').click({ force: true });
  }

  controlPlaneNodesValue(controlPlane) {
    cy.contains('Control plane nodes')
      .parent()
      .parent()
      .find('span')
      .should('include.text', controlPlane);
  }

  infrastructureNodesValue(infrastructureNodes) {
    cy.contains('Infrastructure nodes')
      .parent()
      .parent()
      .find('span')
      .should('include.text', infrastructureNodes);
  }

  workerNodesValue = () => cy.contains('strong', 'Worker nodes');

  securityGroupsValue = () => cy.getByTestId('Security-groups').find('div');

  kmsServiceAccountInput = () => cy.get('input[id="kms_service_account"]');

  closePopoverDialogs() {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Close"]').filter(':visible').length > 0) {
        cy.get('button[aria-label="Close"]').filter(':visible').click();
      }
    });
  }

  setClusterName(clusterName) {
    cy.get(this.clusterNameInput).scrollIntoView().type('{selectAll}').type(clusterName);
  }

  setDomainPrefix(domainPrefix) {
    this.domainPrefixInput().scrollIntoView().type('{selectAll}').type(domainPrefix);
  }

  enableAutoScaling() {
    cy.get('input[id="autoscalingEnabled"]').scrollIntoView().check({ force: true });
  }

  setMinimumNodeCount(nodeCount) {
    this.minimumNodeInput().type('{selectAll}').type(nodeCount);
  }

  setMaximumNodeCount(nodeCount) {
    this.maximumNodeInput().type('{selectAll}').type(nodeCount);
  }
  useCIDRDefaultValues(value = true) {
    if (value) {
      this.cidrDefaultValuesCheckBox().check();
    } else {
      this.cidrDefaultValuesCheckBox().uncheck();
    }
  }

  selectClusterPrivacy(privacy) {
    if (privacy.toLowerCase() == 'private') {
      this.clusterPrivacyPrivateRadio().check({ force: true });
    } else {
      this.clusterPrivacyPublicRadio().check({ force: true });
    }
  }

  selectAutoScaling(autoScale) {
    if (autoScale.toLowerCase() == 'disabled') {
      this.enableAutoscalingCheckbox().uncheck();
    } else {
      this.enableAutoscalingCheckbox().check();
    }
  }

  selectSubscriptionType(subscriptionType) {
    if (subscriptionType.toLowerCase().includes('on-demand')) {
      this.subscriptionTypeOnDemandFlexibleRadio().check({ force: true });
    } else if (subscriptionType.toLowerCase().includes('annual')) {
      this.subscriptionTypeAnnualFixedCapacityRadio().check({ force: true });
    } else {
      this.subscriptionTypeFreeTrailRadio().check({ force: true });
    }
  }

  isCuratedBillingModelEnabledAndSelected() {
    this.subscriptionTypeOnDemandFlexibleRadio().should('be.checked');
    this.infrastructureTypeClusterCloudSubscriptionRadio().should('be.checked');
    this.infrastructureTypeRedHatCloudAccountRadio().should('not.exist');
    this.subscriptionTypeAnnualFixedCapacityRadio().should('not.exist');
    this.subscriptionTypeFreeTrialRadio().should('not.exist');
  }

  selectInfrastructureType(infrastructureType) {
    if (infrastructureType.toLowerCase().includes('customer cloud')) {
      this.infrastructureTypeClusterCloudSubscriptionRadio().check({ force: true });
    } else {
      this.infrastructureTypeRedHatCloudAccountRadio().check({ force: true });
    }
  }

  selectCloudProvider(cloudProvider) {
    if (cloudProvider.toLowerCase() == 'aws') {
      this.awsCloudProviderCard().click();
    } else {
      this.gcpCloudProviderCard().click();
    }
  }

  selectAvailabilityZone(az) {
    if (az.toLowerCase() == 'single zone' || az.toLowerCase() == 'single-zone') {
      this.singleZoneAvailabilityRadio().check();
    } else {
      this.multiZoneAvilabilityRadio().check();
    }
  }

  enableSecureBootSupportForShieldedVMs(enable) {
    if (enable) {
      this.enableSecureBootSupportForShieldedVMsCheckbox().check();
    } else {
      this.enableSecureBootSupportForShieldedVMsCheckbox().uncheck();
    }
  }

  selectPersistentStorage(storageType) {
    cy.get('select[aria-label="Persistent Storage"]').select(storageType);
  }

  selectLoadBalancers(loadBalancers) {
    cy.get('select[aria-label="Load Balancers"]').select(loadBalancers);
  }

  enableAdditionalEtcdEncryption(enable, fipsCryptography = false) {
    this.advancedEncryptionLink().click();

    if (enable) {
      this.enableAdditionalEtcdEncryptionCheckbox().check();
      if (fipsCryptography) {
        this.enableFIPSCryptographyCheckbox().check();
      }
    } else {
      this.enableFIPSCryptographyCheckbox().uncheck();
    }
  }

  selectComputeNodeType(computeNodeType) {
    cy.get('button[aria-label="Machine type select toggle"]', { timeout: 40000 })
      .should('exist')
      .scrollIntoView()
      .should('be.visible')
      .click();
    cy.get('input[aria-label="Machine type select search field"]').clear().type(computeNodeType);
    cy.get('div').contains(computeNodeType).click();
  }

  selectComputeNodeCount(nodeCount) {
    this.computeNodeCountSelect().should('have.value', nodeCount.toString());
  }

  addNodeLabelKeyAndValue(key, value = '', index = 0) {
    cy.get(`input[id="node_labels.${index}.key"]`).scrollIntoView().clear().type(key).blur();
    cy.get(`input[id="node_labels.${index}.value"]`).scrollIntoView().clear().type(value).blur();
  }

  selectNodeDraining(nodeDrain) {
    cy.getByTestId('grace-period-select').click();
    cy.get('button').contains(nodeDrain).click();
  }

  isTextContainsInPage(text, present = true) {
    if (present) {
      cy.contains(text).should('exist').should('be.visible');
    } else {
      cy.contains(text).should('not.exist');
    }
  }

  uploadGCPServiceAccountJSON(jsonContent) {
    cy.get('textarea[aria-label="File upload"]')
      .clear()
      .invoke('val', jsonContent)
      .trigger('input');
    cy.get('textarea[aria-label="File upload"]').type(' {backspace}');
  }
  selectWorkloadIdentityConfiguration(wifConfig) {
    cy.get('button[id="gcp_wif_config"]').click();
    cy.get('input[placeholder="Filter by name / ID"]').clear().type(wifConfig);
    cy.contains(wifConfig).scrollIntoView().click();
  }
}

export default new CreateOSDCluster();
