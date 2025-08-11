import Page from './page';

class CreateRosaCluster extends Page {
  clusterDetailsTree = () => cy.get('button').contains('Details');

  rosaCreateClusterButton = () => cy.getByTestId('rosa-create-cluster-button', { timeout: 50000 });

  rosaNextButton = () => cy.getByTestId('wizard-next-button');

  rosaBackButton = () => cy.getByTestId('wizard-back-button');

  rosaCancelButton = () => cy.getByTestId('wizard-cancel-button');

  rosaClusterWithCLI = () => cy.get('a').contains('With CLI');

  rosaClusterWithWeb = () => cy.get('a').contains('With web interface');

  backToNetworkingConfigurationLink = () =>
    cy.get('button').contains('Back to the networking configuration');

  reviewAndCreateTree = () =>
    cy.get('li, [role="tab"], .wizard-nav-item').find('button').contains('Review and create');

  createCustomDomainPrefixCheckbox = () => cy.get('input[id="has_domain_prefix"]');

  domainPrefixInput = () => cy.get('input[name="domain_prefix"]');

  machineCIDRInput = () => {
    return cy.get('input[id="network_machine_cidr"]');
  };

  serviceCIDRInput = () => {
    return cy.get('input[id="network_service_cidr"]');
  };

  podCIDRInput = () => cy.get('input[id="network_pod_cidr"]');

  hostPrefixInput = () => cy.get('input[id="network_host_prefix"]');

  httpProxyInput = () => cy.get('input[id="http_proxy_url"]');

  httpsProxyInput = () => cy.get('input[id="https_proxy_url"]');

  noProxyDomainsInput = () => cy.get('input[id="no_proxy_domains"]');

  selectVersionValue = () => cy.get('button[id="version-selector"]').find('span');

  customOperatorPrefixInput = () => cy.get('#custom_operator_roles_prefix');

  singleZoneAvilabilityRadio = () =>
    cy.get('input[id="form-radiobutton-multi_az-false-field"]').should('be.exist');

  multiZoneAvilabilityRadio = () =>
    cy.get('input[id="form-radiobutton-multi_az-true-field"]').should('be.exist');

  advancedEncryptionLink = () => cy.get('span').contains('Advanced Encryption');

  additionalSecurityGroupsLink = () => cy.get('span').contains('Additional security groups');

  applySameSecurityGroupsToAllNodeTypes = () =>
    cy.get('input[id="securityGroups.applyControlPlaneToAll"]');

  useDefaultKMSKeyRadio = () =>
    cy.get('input[id="form-radiobutton-customer_managed_key-false-field"]').should('be.exist');

  useCustomKMSKeyRadio = () =>
    cy.get('input[id="form-radiobutton-customer_managed_key-true-field"]').should('be.exist');

  kmsKeyARNHelpText = () => cy.get('#kms_key_arn-helper');

  enableAdditionalEtcdEncryptionCheckbox = () => cy.get('input[id="etcd_encryption"]');

  enableFIPSCryptographyCheckbox = () => cy.get('input[id="fips"]');

  useBothIMDSv1AndIMDSv2Radio = () => cy.getByTestId('imds-optional');

  useIMDSv2Radio = () => cy.getByTestId('imds-required');

  rootDiskSizeInput = () => cy.get('input[name="worker_volume_size_gib"]');

  editNodeLabelLink = () => cy.get('span').contains('Add node labels');

  addMachinePoolLink = () => cy.contains('Add machine pool').should('be.exist');

  addAdditionalLabelLink = () => cy.contains('Add additional label').should('be.exist');

  createClusterButton = () => cy.getByTestId('wizard-next-button');

  rosaListOcmField = () => cy.getByTestId('copy-rosa-list-ocm-role');

  rosaCreateOcmTab = () => cy.getByTestId('copy-ocm-role-tab-no');

  rosaLinkOcmTab = () => cy.getByTestId('copy-ocm-role-tab-yes');

  rosaCreateOcmField = () => cy.getByTestId('copy-rosa-create-ocm-role');

  rosaCreateOcmAdminField = () => cy.getByTestId('copy-rosa-create-ocm-admin-role');

  rosaLinkOcmField = () => cy.getByTestId('copy-rosa-link-ocm-role');

  rosaListUserField = () => cy.getByTestId('copy-rosa-list-user-role');

  rosaCreateUserTab = () => cy.getByTestId('copy-user-role-tab-no');

  rosaLinkUserTab = () => cy.getByTestId('copy-user-role-tab-yes');

  rosaCreateUserField = () => cy.getByTestId('copy-rosa-create-user-role');

  rosaLinkUserField = () => cy.getByTestId('copy-rosa-link-user-role');

  rosaAssociateDrawerFirstStepButton = () => cy.contains('Step 1: OCM role');

  rosaAssociateDrawerSecondStepButton = () => cy.contains('Step 2: User role');

  rosaAssociateDrawerThirdStepButton = () => cy.contains('Step 3: Account roles');

  rosaCreateAccountRolesField = () => cy.getByTestId('copy-rosa-create-account-role');

  operatorRoleCommandInput = () => {
    return cy.get('input[aria-label="Copyable ROSA create operator-roles"]');
  };

  refreshInfrastructureAWSAccountButton = () =>
    cy.get('button[data-testid="refresh-aws-accounts"]').first();

  refreshBillingAWSAccountButton = () =>
    cy.get('button[data-testid="refresh-aws-accounts"]').second();

  howToAssociateNewAWSAccountButton = () => cy.getByTestId('launch-associate-account-btn');

  howToAssociateNewAWSAccountDrawerCloseButton = () =>
    cy.getByTestId('close-associate-account-btn');

  howToAssociateNewAWSAccountDrawerXButton = () => cy.get('[aria-label="Close drawer panel"]');

  rosaHelpMeDecideButton = () => cy.get('button').contains('Help me decide');

  supportRoleInput = () => cy.get('input[id="support_role_arn"]');

  workerRoleInput = () => cy.get('input[id="worker_role_arn"]');

  controlPlaneRoleInput = () => cy.get('input[id="control_plane_role_arn"]');

  minimumNodeInput = () => cy.get('input[aria-label="Minimum nodes"]');

  maximumNodeInput = () => cy.get('input[aria-label="Maximum nodes"]');

  installIntoExistingVpcCheckbox = () => cy.get('#install_to_vpc');

  usePrivateLinkCheckbox = () => cy.get('#use_privatelink');

  clusterNameValidationSuccessIndicator = () =>
    cy.get('button[aria-label="All validation rules met"]');

  clusterNameValidationFailureIndicator = () =>
    cy.get('button[aria-label="Not all validation rules met"]');

  minimumNodeCountMinusButton = () => cy.get('button[aria-label="Minimum nodes minus"]');

  minimumNodeCountPlusButton = () => cy.get('button[aria-label="Minimum nodes plus"]');

  maximumNodeCountMinusButton = () => cy.get('button[aria-label="Maximum nodes minus"]');

  maximumNodeCountPlusButton = () => cy.get('button[aria-label="Maximum nodes plus"]');

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

  clusterVersionPane = () => cy.get('div[name="cluster_version"]');

  clusterAutoscalingCloseButton = () => cy.get('button').contains('Close');

  cidrDefaultValuesCheckBox = () => cy.get('input[id="cidr_default_values_toggle"]');

  createModeAutoRadio = () => cy.getByTestId('rosa_roles_provider_creation_mode-auto');

  createModeManualRadio = () => cy.getByTestId('rosa_roles_provider_creation_mode-manual');
  applicationIngressDefaultSettingsRadio = () => cy.getByTestId('applicationIngress-default');

  applicationIngressCustomSettingsRadio = () => cy.getByTestId('applicationIngress-custom');

  applicationIngressRouterSelectorsInput = () => cy.get('input#defaultRouterSelectors');

  applicationIngressExcludedNamespacesInput = () =>
    cy.get('input#defaultRouterExcludedNamespacesFlag');

  clusterPrivacyPublicRadio = () => cy.getByTestId('cluster_privacy-external');

  clusterPrivacyPrivateRadio = () => cy.getByTestId('cluster_privacy-internal');

  recurringUpdateRadio = () => cy.getByTestId('upgrade_policy-automatic');

  individualUpdateRadio = () => cy.getByTestId('upgrade_policy-manual');

  externalAuthenticationLink = () => cy.get('button').contains('External Authentication');

  externalAuthenticationCheckbox = () => cy.get('input[id="enable_external_authentication"]');

  computeNodeRangeLabelValue = () => cy.getByTestId('Compute-node-range');

  noProxyDomainsLabelValue = () => cy.getByTestId('No-Proxy-domains');

  machinePoolLabelValue = () => cy.getByTestId('Machine-pools');

  computeNodeRangeValue = () => cy.getByTestId('Compute-node-range').find('div');

  isCreateRosaPage() {
    super.assertUrlIncludes('/openshift/create/rosa/wizard');
  }

  isAccountsAndRolesScreen() {
    cy.contains('h3', 'AWS infrastructure account');
  }

  isClusterDetailsScreen() {
    this.clusterVersionPane()
      .scrollIntoView()
      .within(() => {
        cy.get('button[id="version-selector"]', { timeout: 40000 }).should('be.visible');
      });
    cy.contains('h3', 'Cluster details');
  }

  isVPCSettingsScreen() {
    cy.contains('h3', 'Virtual Private Cloud (VPC) subnet settings');
  }

  isClusterMachinepoolsScreen(hosted = false) {
    let machinePoolHeaderText = 'Default machine pool';
    if (hosted) {
      machinePoolHeaderText = 'Machine pools';
    }
    cy.contains('h3', machinePoolHeaderText).scrollIntoView();
  }

  isControlPlaneTypeScreen() {
    cy.contains('h2', 'Welcome to Red Hat OpenShift Service on AWS (ROSA)', { timeout: 30000 });
    cy.contains('h3', 'Select the ROSA architecture based on your control plane requirements');
  }

  isAssociateAccountsDrawer() {
    cy.contains('span', 'How to associate a new AWS account').should('be.visible');
    cy.contains('continue to step');
  }

  isNotAssociateAccountsDrawer() {
    cy.contains('h2', 'How to associate a new AWS account').should('not.exist');
  }

  cancelWizard() {
    cy.contains('button', 'Cancel').click();
  }

  isMachinePoolScreen() {
    cy.contains('h3', 'Default machine pool');
  }

  isNetworkingScreen() {
    cy.contains('h3', 'Networking configuration');
  }

  isClusterWideProxyScreen() {
    cy.contains('h3', 'Cluster-wide proxy');
  }
  isCIDRScreen() {
    cy.contains('h3', 'CIDR ranges');
  }

  isClusterRolesAndPoliciesScreen() {
    cy.contains('h3', 'Cluster roles and policies');
  }

  isUpdatesScreen() {
    cy.contains('h3', 'Cluster update strategy');
  }

  isReviewScreen() {
    cy.contains('h2', 'Review your dedicated cluster');
  }

  showsNoARNsDetectedAlert() {
    cy.contains('h4', 'Some account roles ARNs were not detected');
  }

  showsNoUserRoleAlert() {
    cy.contains('h4', 'A user-role could not be detected');
  }

  showsNoOcmRoleAlert() {
    cy.contains('h4', 'Cannot detect an OCM role');
  }

  showsFakeClusterBanner = () => cy.contains('On submit, a fake ROSA cluster will be created.');

  showsNoAssociatedAccounts = () => cy.getByTestId('no_associated_accounts').should('be.visible');

  isSelectedVersion = (testVersion) => {
    cy.get('button[role="option"][aria-selected="true"]')
      .scrollIntoView()
      .invoke('text')
      .should('eq', testVersion);
  };

  isTextContainsInPage(text, present = true) {
    if (present) {
      cy.contains(text).scrollIntoView().should('be.exist').should('be.visible');
    } else {
      cy.contains(text).should('not.exist');
    }
  }

  get accountIdMenuItem() {
    return '[role="option"]';
  }

  get associatedAccountsDropdown() {
    return 'button[aria-describedby="aws-infra-accounts"]:not([disabled])';
  }

  get versionsDropdown() {
    return 'div[name="cluster_version"] button[aria-haspopup="listbox"]';
  }

  get ARNFieldRequiredMsg() {
    return '[aria-expanded="true"] [role="alert"]';
  }

  get clusterNameInput() {
    return 'input[name="name"]';
  }

  get clusterNameInputError() {
    return 'ul#rich-input-popover-name li[role="alert"]';
  }

  get primaryButton() {
    return '[data-testid="wizard-next-button"]';
  }

  selectStandaloneControlPlaneTypeOption() {
    cy.getByTestId('standalone-control-planes').find('input').check({ force: true });
  }

  selectHostedControlPlaneTypeOption() {
    cy.getByTestId('hosted-control-planes').find('input').check({ force: true });
  }

  selectAWSInfrastructureAccount(accountID) {
    cy.get('button[id="associated_aws_id"]').click();
    cy.get('input[placeholder*="Filter by account ID"]', { timeout: 50000 })
      .clear()
      .type(accountID);
    cy.get('li').contains(accountID).click();
  }

  selectAWSBillingAccount(accountID) {
    cy.get('#billing_account_id').click();
    cy.get('input[placeholder*="Filter by account ID"]', { timeout: 50000 })
      .clear()
      .type(accountID);
    cy.get('li').contains(accountID).click();
  }

  waitForARNList() {
    cy.get('[role="progressbar"], .spinner, [data-loading="true"]', { timeout: 80000 }).should(
      'not.exist',
    );
    cy.getByTestId('spinner-loading-arn-text', { timeout: 80000 }).should('not.exist');
  }

  selectInstallerRole(roleName) {
    cy.get('button')
      .contains(new RegExp(`Installer-Role$`))
      .then(($btn) => {
        if ($btn.text().includes(roleName)) {
        } else {
          $btn.click();
          cy.get('div[id="installer_role_arn"]')
            .find('button')
            .contains(roleName)
            .scrollIntoView()
            .click({ force: true });
        }
      });
  }

  selectVPC(vpcName) {
    this.clickButtonContainingText('Select a VPC');
    cy.get('input[placeholder="Filter by VPC ID / name"]', { timeout: 50000 })
      .clear()
      .type(vpcName);
    cy.contains(vpcName).scrollIntoView().click();
  }

  selectFirstVPC() {
    cy.get('[aria-label="select VPC"]').first().click();
  }

  selectFirstAvailabilityZone() {
    cy.get('[aria-label="availability zone list"]').children().first().click();
  }

  selectFirstPrivateSubnet() {
    cy.get('[aria-label="Private subnet"]').contains('private').first().click();
  }

  selectMachinePoolPrivateSubnet(
    privateSubnetNameOrId,
    machinePoolIndex = 1,
    viewUsedSubnets = false,
  ) {
    let mpIndex = machinePoolIndex - 1;
    cy.get(`button[id="machinePoolsSubnets[${mpIndex}].privateSubnetId"]`).click();
    if (viewUsedSubnets) {
      cy.contains('button', 'View Used Subnets').scrollIntoView().click();
    }
    cy.get('input[placeholder="Filter by subnet ID / name"]', { timeout: 50000 })
      .clear()
      .type(privateSubnetNameOrId);
    cy.get('li').contains(privateSubnetNameOrId).scrollIntoView().click();
  }

  checkVieworHideUsedSubnetsPresence(usedSubnetNameOrId, machinePoolIndex = 1) {
    let mpIndex = machinePoolIndex - 1;
    cy.get(`button[id="machinePoolsSubnets[${mpIndex}].privateSubnetId"]`).click();
    cy.contains('button', 'View Used Subnets').scrollIntoView().should('be.visible').click();
    cy.get('li').contains(usedSubnetNameOrId).scrollIntoView().should('be.visible');
    cy.contains('button', 'Hide Used Subnets').scrollIntoView().should('be.visible').click();
    cy.get('li').should('not.contain', usedSubnetNameOrId);
    cy.contains('button', 'View Used Subnets').scrollIntoView().should('be.visible');
    cy.get(`button[id="machinePoolsSubnets[${mpIndex}].privateSubnetId"]`).blur();
  }

  removeMachinePool(machinePoolIndex = 1) {
    let mpIndex = machinePoolIndex - 1;
    cy.getByTestId(`remove-machine-pool-${mpIndex}`).click();
  }
  selectMachinePoolPublicSubnet(publicSubnetNameOrId) {
    this.clickButtonContainingText('Select public subnet');
    cy.get('input[placeholder="Filter by subnet ID / name"]', { timeout: 50000 })
      .clear()
      .type(publicSubnetNameOrId);
    cy.contains(publicSubnetNameOrId).scrollIntoView().click();
  }

  waitForVPCList() {
    cy.get('[role="progressbar"], .spinner, [data-loading="true"]', { timeout: 100000 }).should(
      'not.exist',
    );
    cy.getByTestId('refresh-vpcs', { timeout: 80000 }).should('not.be.disabled');
  }

  selectOidcConfigId(configID) {
    this.clickButtonContainingText('Select a config id');
    cy.get('input[placeholder="Filter by config ID"]').clear().type(configID);
    cy.contains(configID).scrollIntoView().click({ force: true });
  }

  setClusterName(clusterName) {
    cy.get(this.clusterNameInput).scrollIntoView().type('{selectAll}').type(clusterName).blur();
  }

  setDomainPrefix(domainPrefix) {
    this.domainPrefixInput().scrollIntoView().type('{selectAll}').type(domainPrefix).blur();
  }

  selectClusterVersion(version) {
    cy.get('button[id="version-selector"]').click();
    cy.get('button').contains(version).click();
  }

  selectClusterVersionFedRamp(version) {
    cy.get('div[name="version-selector"]').click();
    cy.get('button').contains(version).click();
  }

  addNodeLabelKeyAndValue(key, value = '', index = 0) {
    cy.get('input[aria-label="Key-value list key"]').each(($el, indx) => {
      if (index === indx) {
        cy.wrap($el).clear().type(key);
        return;
      }
    });
    cy.get('input[aria-label="Key-value list value"]').each(($el, indx) => {
      if (index === indx) {
        cy.wrap($el).clear().type(value);
        return;
      }
    });
  }

  isNodeLabelKeyAndValue(key, value = '', index = 0) {
    cy.get('input[aria-label="Key-value list key"]').each(($el, indx) => {
      if (index === indx) {
        cy.wrap($el).should('have.value', key);
        return;
      }
    });
    cy.get('input[aria-label="Key-value list value"]').each(($el, indx) => {
      if (index === indx) {
        cy.wrap($el).should('have.value', value);
        return;
      }
    });
  }

  selectRegion(region) {
    cy.get('select[name="region"]').select(region);
  }

  selectComputeNodeType(computeNodeType) {
    cy.get('button[aria-label="Machine type select toggle"]').click();
    cy.get('input[aria-label="Machine type select search field"]').clear().type(computeNodeType);
    cy.get('div').contains(computeNodeType).click();
  }
  selectGracePeriod(gracePeriod) {
    cy.getByTestId('grace-period-select').click({ force: true });
    cy.get('button').contains(gracePeriod).click({ force: true });
  }

  enableAutoScaling() {
    cy.get('input[id="autoscalingEnabled"]').check({ force: true });
  }

  inputMinNodeCount(minNodeCount) {
    cy.get('[aria-label="Minimum nodes"]').clear().type(`{rightArrow}${minNodeCount}`);
    cy.get('body').click();
    cy.get('[aria-label="Minimum nodes"]').should('have.value', Cypress.env('MIN_NODE_COUNT'));
  }

  inputMaxNodeCount(maxNodeCount) {
    cy.get('[aria-label="Maximum nodes"]').clear().type(`{rightArrow}${maxNodeCount}`);
    cy.get('body').click();
    cy.get('[aria-label="Maximum nodes"]').should('have.value', maxNodeCount);
  }

  disabledAutoScaling() {
    cy.get('input[id="autoscalingEnabled"]').uncheck({ force: true });
  }

  selectComputeNodeCount(count) {
    cy.get('select[name="nodes_compute"]').select(count);
  }

  selectClusterPrivacy(privacy) {
    if (privacy.toLowerCase() == 'private') {
      this.clusterPrivacyPrivateRadio().check();
    } else {
      this.clusterPrivacyPublicRadio().check();
    }
  }

  selectUpdateStratergy(stratergy) {
    if (stratergy == 'Recurring updates') {
      this.recurringUpdateRadio().check({ force: true });
    } else {
      this.individualUpdateRadio().check({ force: true });
    }
  }

  selectAvailabilityZone(az) {
    if (az.toLowerCase() == 'single zone' || az.toLowerCase() == 'single-zone') {
      cy.contains('Single zone').should('be.exist').click();
    } else {
      cy.contains('Multi-zone').should('be.exist').click();
    }
  }

  selectRoleProviderMode(mode) {
    if (mode == 'Auto') {
      this.createModeAutoRadio().check({ force: true });
    } else {
      this.createModeManualRadio().check({ force: true });
    }
  }

  useCIDRDefaultValues(value = true) {
    if (value) {
      this.cidrDefaultValuesCheckBox().check();
    } else {
      this.cidrDefaultValuesCheckBox().uncheck();
    }
  }

  selectOIDCConfigID(configID) {
    cy.get('span').contains('Select a config id').click({ force: true });
    cy.get('ul[name="byo_oidc_config_id"]').find('span').contains(configID).click();
  }

  isClusterPropertyMatchesValue(property, value) {
    cy.contains(property)
      .closest('div:not([class*="wizard"]):not([class*="nav"]), dl, section, tr')
      .should('contain.text', value);
  }

  setMinimumNodeCount(nodeCount) {
    this.minimumNodeInput().type('{selectAll}').type(nodeCount);
  }

  setMaximumNodeCount(nodeCount) {
    this.maximumNodeInput().type('{selectAll}').type(nodeCount);
  }

  waitForClusterId() {
    // Wait 5 min for cluster id to populate on install page
    cy.getByTestId('clusterID', { timeout: 300000 }).should('not.contain', 'N/A');
  }

  waitForClusterReady() {
    // Wait up to 1 hour for cluster to be Ready
    cy.get('[data-status="ready"], .status-ready', { timeout: 3600000 }).should('contain', 'Ready');
  }

  selectGracePeriod(gracePeriod) {
    cy.getByTestId('grace-period-select').click({ force: true });
    cy.get('button').contains(gracePeriod).click({ force: true });
  }

  waitForButtonContainingTextToBeEnabled(text, timeout = 30000) {
    cy.get(`button:contains('${text}')`, { timeout }).scrollIntoView().should('be.enabled');
  }

  clickButtonContainingText(text, options = {}) {
    if (Object.keys(options).length == 0 && options.constructor === Object) {
      cy.get(`button:contains('${text}')`)
        .scrollIntoView()
        .should('be.visible')
        .should('be.enabled')
        .click({ force: true });
    } else {
      cy.get(`button:contains('${text}')`)
        .should('be.enabled')
        .should('be.visible')
        .click({ force: true, ...options });
    }
  }

  isButtonContainingText(text, options = {}) {
    if (Object.keys(options).length == 0 && options.constructor === Object) {
      cy.get(`button:contains('${text}')`)
        .scrollIntoView()
        .should('be.visible')
        .should('be.enabled');
    } else {
      cy.get(`button:contains('${text}')`).should('be.enabled').should('be.visible');
    }
  }

  waitForSpinnerToNotExist() {
    cy.get('.spinner-loading-text').should('not.exist');
  }

  clickCreateClusterBtn() {
    cy.getByTestId('create_cluster_btn').click();
  }

  isRosaCreateClusterDropDownVisible() {
    cy.get('#rosa-create-cluster-dropdown').scrollIntoView().should('be.visible');
  }

  clickRosaCreateClusterDropDownVisible() {
    cy.get('#rosa-create-cluster-dropdown').click();
  }

  isRosaCreateWithWebUIVisible() {
    cy.get('#with-web').should('be.visible');
  }

  clickRosaCreateWithWebUI() {
    cy.get('#with-web').click();
  }

  inputPrivateSubnetId(subnetId) {
    cy.get('#private_subnet_id_0').type(subnetId);
  }

  inputPrivateSubnetIdFedRamp(subnetId) {
    cy.get('button').contains('Select private subnet').click({ force: true });
    this.clickButtonContainingText(subnetId);
  }

  enableCustomerManageKeys() {
    cy.get('#customer_managed_key-true').check().should('be.enabled');
  }

  inputCustomerManageKeyARN(kmsCustomKeyARN) {
    cy.get('#kms_key_arn').clear().type(kmsCustomKeyARN).should('have.value', kmsCustomKeyARN);
  }

  inputEncryptEtcdKeyARN(etcdCustomKeyARN) {
    cy.get('#etcd_key_arn').clear().type(etcdCustomKeyARN).should('have.value', etcdCustomKeyARN);
  }

  enableEtcEncryption() {
    cy.get('#etcd_encryption').check().should('be.enabled');
  }

  isEtcEncryptionDisabled() {
    cy.get('#etcd_encryption').should('be.disabled');
  }

  enableFips() {
    cy.get('#fips').check().should('be.enabled');
  }

  isFipsDisabled() {
    cy.get('#fips').should('be.disabled');
  }

  inputRootDiskSize(rootDiskSize) {
    cy.get('[name="worker_volume_size_gib"]').clear().type(`{rightArrow}${rootDiskSize}`);
    cy.get('body').click();
    cy.get('[name="worker_volume_size_gib"]').should('have.value', rootDiskSize);
  }

  enableIMDSOnly() {
    cy.getByTestId('imds-required').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('imds-required').check();
      }
    });
  }

  imdsOptionalIsEnabled() {
    cy.getByTestId('imds-optional').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('imds-optional').check();
      }
    });
  }

  hideClusterNameValidation() {
    // Validation popup on cluster name field create flaky situation on below version field.
    // To remove the validation popup a click action in cluster left tree required.
    this.clusterDetailsTree().click();
  }

  closePopoverDialogs() {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Close"]:visible').length > 0) {
        cy.get('button[aria-label="Close"]').filter(':visible').click();
      }
    });
  }

  inputNodeLabelKvs(nodeLabelKvs) {
    cy.wrap(nodeLabelKvs).each((kv, index) => {
      const key = Object.keys(kv)[0];
      const value = kv[key];
      cy.get(`[name="node_labels[${index}].key"]`).type(key);
      cy.get(`[name="node_labels[${index}].value"]`).type(value);
      if (index < nodeLabelKvs.length - 1) {
        CreateRosaWizardPage.clickButtonContainingText('Add additional label');
      }
    });
  }

  enableClusterPrivacyPublic() {
    cy.getByTestId('cluster_privacy-external').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('cluster_privacy-external').check();
      }
    });
  }

  enableClusterPrivacyPrivate() {
    cy.getByTestId('cluster_privacy-internal').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('cluster_privacy-internal').check();
      }
    });
  }

  clusterPrivacyIsDisabled() {
    cy.get('#cluster_privacy-internal').should('be.disabled');
  }

  enableInstallIntoExistingVpc() {
    this.installIntoExistingVpcCheckbox().check().should('be.enabled');
  }

  enableConfigureClusterWideProxy() {
    cy.get('#configure_proxy').check().should('be.enabled');
  }

  enableUpgradePolicyManual() {
    cy.getByTestId('upgrade_policy-manual').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('upgrade_policy-manual').check();
      }
    });
  }

  enableUpgradePolicyAutomatic() {
    cy.getByTestId('upgrade_policy-automatic').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('upgrade_policy-automatic').check();
      }
    });
  }

  enableRosaRolesProviderCreationModeManual() {
    cy.getByTestId('rosa_roles_provider_creation_mode-manual').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('rosa_roles_provider_creation_mode-manual').check();
      }
    });
  }

  enableRosaRolesProviderCreationModeAuto() {
    cy.getByTestId('rosa_roles_provider_creation_mode-auto').then(($elem) => {
      if (!$elem.prop('checked')) {
        cy.getByTestId('rosa_roles_provider_creation_mode-auto').check();
      }
    });
  }

  clickEditStepOfSection(stepSection) {
    cy.getByTestId(`"${stepSection}"`).click();
  }
  get clusterNameInputError() {
    return 'ul#rich-input-popover-name li.pf-c-helper-text__item.pf-m-error.pf-m-dynamic';
  }

  validateItemsInList(listOfMatchValues, listSelector) {
    cy.wrap(listOfMatchValues).each((value, index) => {
      cy.get(listSelector).eq(index).should('contain', value);
    });
  }

  clickBody() {
    cy.get('body').click();
  }

  validateElementsWithinShouldMethodValue(withinSelector, elementsWithin) {
    cy.get(withinSelector).within(() => {
      cy.wrap(elementsWithin).each((elementData) => {
        if (!elementData.value) {
          cy.get(elementData.element).should(elementData.method);
        } else {
          cy.get(elementData.element).should(elementData.method, elementData.value);
        }
      });
    });
  }

  selectSubnetAvailabilityZone(subnetAvailability) {
    cy.contains('button', 'Select availability zone').first().click();
    cy.get('ul[aria-label="availability zone list"]').within(() => {
      cy.contains('button', subnetAvailability).click({ force: true });
    });
  }

  isSubnetAvailabilityZoneSelected(zone) {
    cy.get('button').contains(zone).should('be.visible');
  }

  isPrivateSubnetSelected(index = 0, privateSubnetNameOrId) {
    cy.get(`button[id="machinePoolsSubnets[${index}].privateSubnetId"]`)
      .contains(privateSubnetNameOrId)
      .should('be.visible');
  }

  isPubliceSubnetSelected(index = 0, publicSubnetNameOrId) {
    cy.get(`button[id="machinePoolsSubnets[${index}].publicSubnetId"]`)
      .contains(publicSubnetNameOrId)
      .should('be.visible');
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

  selectAdditionalSecurityGroups(securityGroups) {
    cy.get('button').contains('Select security groups').click({ force: true });
    cy.getByTestId('securitygroups-id').contains(securityGroups).click({ force: true });
    cy.get('button').contains('Select security groups').click({ force: true });
  }
}

export default new CreateRosaCluster();
