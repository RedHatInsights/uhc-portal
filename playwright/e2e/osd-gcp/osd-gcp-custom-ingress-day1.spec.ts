import { expect, test } from '../../fixtures/pages';
import { CreateOSDWizardPage } from '../../page-objects/create-osd-wizard-page';

const clusterProfiles = require('../../fixtures/osd-gcp/osd-ccs-gcp-custom-ingress.spec.json');
const clusterProperties = clusterProfiles['osd-gcp-ingress-public-advanced']['day1-profile'];

const clusterNamePrefix = clusterProperties.ClusterName;
/** Unique per run so Day-2 can target this cluster via CLUSTER_NAME. */
const clusterName = `${clusterNamePrefix}-${Math.random().toString(36).slice(2, 7)}`;
const clusterDomainPrefix = `osd${Math.random().toString(36).substring(2, 13)}`;
const authType = clusterProperties.AuthenticationType;
const isWif = authType.includes('Workload Identity Federation');
const QE_GCP_WIF_CONFIG = process.env.QE_GCP_WIF_CONFIG || '';
const QE_GCP = process.env.QE_GCP_OSDCCSADMIN_JSON;

async function fillAllExcludeNamespaceSelectors(
  createOSDWizardPage: CreateOSDWizardPage,
  selectors: { Key: string; Values: string }[],
): Promise<void> {
  for (let i = 0; i < selectors.length; i++) {
    if (i > 0) {
      await createOSDWizardPage.addExcludeNamespaceSelectorRow();
    }
    await createOSDWizardPage.fillExcludeNamespaceSelector(
      i,
      selectors[i].Key,
      selectors[i].Values,
    );
  }
}
test.describe.serial(
  'OSD GCP WIF networking day-1 – exclude namespace selectors',
  { tag: ['@day1', '@smoke', '@osd', '@gcp', '@networking', '@custom-ingress'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      if (isWif && !QE_GCP_WIF_CONFIG?.trim()) {
        throw new Error('QE_GCP_WIF_CONFIG must be set for WIF authentication');
      }
      if (!isWif && !QE_GCP?.trim()) {
        throw new Error('QE_GCP_OSDCCSADMIN_JSON must be set for Service Account authentication');
      }

      await navigateTo('create');
    });

    test('Launch OSD GCP wizard', async ({ createOSDWizardPage }) => {
      console.log(`Day-1 cluster name (use for Day-2): ${clusterName}`);
      await createOSDWizardPage.waitAndClick(createOSDWizardPage.osdCreateClusterButton());
      await createOSDWizardPage.isCreateOSDPage();
    });

    test('Billing model – Annual fixed capacity and customer cloud subscription', async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isBillingModelScreen();
      await createOSDWizardPage.selectSubscriptionType(clusterProperties.SubscriptionType);
      await createOSDWizardPage.selectInfrastructureType(clusterProperties.InfrastructureType);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test(`Cloud provider – GCP ${authType}`, async ({ page, createOSDWizardPage }) => {
      await createOSDWizardPage.isCloudProviderSelectionScreen();
      await createOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);

      if (isWif) {
        await createOSDWizardPage.workloadIdentityFederationButton().click();
        await createOSDWizardPage.selectWorkloadIdentityConfiguration(QE_GCP_WIF_CONFIG);
      } else {
        await createOSDWizardPage.serviceAccountButton().click();
        await createOSDWizardPage.uploadGCPServiceAccountJSON(QE_GCP || '{}');
      }

      await createOSDWizardPage.acknowlegePrerequisitesCheckbox().check();
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test('Cluster details', async ({ page, createOSDWizardPage }) => {
      await createOSDWizardPage.isClusterDetailsScreen();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().scrollIntoViewIfNeeded();
      await createOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      await createOSDWizardPage.setClusterName(clusterName);
      await createOSDWizardPage.hideClusterNameValidation();
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.setDomainPrefix(clusterDomainPrefix);
      await createOSDWizardPage.closePopoverDialogs();
      await createOSDWizardPage.selectRegion(clusterProperties.Region);
      await createOSDWizardPage.selectVersion(
        clusterProperties.Version || process.env.VERSION || '',
      );
      await createOSDWizardPage.enableSecureBootSupportForSchieldedVMs(true);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test('Machine pool', async ({ page, createOSDWizardPage }) => {
      await createOSDWizardPage.isMachinePoolScreen();
      await createOSDWizardPage.selectComputeNodeType(
        clusterProperties.MachinePools[0].InstanceType,
      );
      await createOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools[0].NodeCount);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test('Networking – empty exclude namespace selector validations', async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.selectApplicationIngressCustomSettings();
      await createOSDWizardPage.ensureExcludeNamespaceSelectorsSectionVisible();

      // Route selector and excluded namespaces are always shown with custom ingress.
      // Exclude namespace selectors default to empty
      await createOSDWizardPage.expectApplicationIngressRouteFieldsEmpty();

      await page.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isCIDRScreen();
      await page.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isClusterUpdatesScreen();
      await page.locator(createOSDWizardPage.primaryButton).click();
      await createOSDWizardPage.isReviewScreen();

      await expect(createOSDWizardPage.routeSelectorsReviewValue()).toHaveText(
        clusterProperties.RouteSelectorEmptyReviewDisplay,
      );
      await expect(createOSDWizardPage.excludedNamespacesReviewValue()).toHaveText(
        clusterProperties.ExcludedNamespacesEmptyReviewDisplay,
      );
      await expect(createOSDWizardPage.excludeNamespaceSelectorsReviewValue()).toHaveText(
        clusterProperties.ExcludeNamespaceSelectorsEmptyReviewDisplay,
      );
      await expect(createOSDWizardPage.namespaceOwnershipPolicyReviewValue()).toHaveText(
        clusterProperties.NamespaceOwnershipPolicyReviewDisplay,
      );
      await expect(createOSDWizardPage.wildcardPolicyReviewValue()).toHaveText(
        clusterProperties.WildcardPolicyReviewDisplay,
      );

      await createOSDWizardPage.wizardBackButton().click();
      await createOSDWizardPage.isClusterUpdatesScreen();
      await createOSDWizardPage.wizardBackButton().click();
      await createOSDWizardPage.isCIDRScreen();
      await createOSDWizardPage.wizardBackButton().click();
      await createOSDWizardPage.isNetworkingScreen();
    });

    test('Networking – enter valid custom ingress controller settings', async ({
      page,
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isNetworkingScreen();
      await createOSDWizardPage.ensureExcludeNamespaceSelectorsSectionVisible();

      await createOSDWizardPage
        .applicationIngressRouterSelectorsInput()
        .fill(clusterProperties.RouteSelector.Value);
      await createOSDWizardPage
        .applicationIngressExcludedNamespacesInput()
        .fill(clusterProperties.ExcludedNamespaces.Value);

      const namespaceSwitch = createOSDWizardPage.namespaceOwnershipPolicySwitch();
      const wildcardSwitch = createOSDWizardPage.wildcardPolicySwitch();
      const shouldBeStrict = clusterProperties.NamespaceOwnershipPolicy === 'Strict';
      const shouldAllowWildcard = clusterProperties.WildcardPolicy === 'Allowed';

      if ((await namespaceSwitch.isChecked()) !== shouldBeStrict) {
        await namespaceSwitch.click();
      }
      await expect(namespaceSwitch).toBeChecked({ checked: shouldBeStrict });

      if ((await wildcardSwitch.isChecked()) !== shouldAllowWildcard) {
        await wildcardSwitch.click();
      }
      if (shouldAllowWildcard) {
        await expect(page.getByRole('switch', { name: 'Allowed' })).toBeChecked();
      } else {
        await expect(wildcardSwitch).not.toBeChecked();
      }

      await expect(createOSDWizardPage.applicationIngressRouterSelectorsInput()).toHaveValue(
        clusterProperties.RouteSelector.Value,
      );
      await expect(createOSDWizardPage.applicationIngressExcludedNamespacesInput()).toHaveValue(
        clusterProperties.ExcludedNamespaces.Value,
      );

      await fillAllExcludeNamespaceSelectors(
        createOSDWizardPage,
        clusterProperties.ExcludeNamespaceSelectors,
      );

      await createOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test('CIDR ranges', async ({ page, createOSDWizardPage }) => {
      await createOSDWizardPage.isCIDRScreen();
      await expect(createOSDWizardPage.machineCIDRInput()).toHaveValue(
        clusterProperties.MachineCIDR,
      );
      await expect(createOSDWizardPage.serviceCIDRInput()).toHaveValue(
        clusterProperties.ServiceCIDR,
      );
      await expect(createOSDWizardPage.podCIDRInput()).toHaveValue(clusterProperties.PodCIDR);
      await expect(createOSDWizardPage.hostPrefixInput()).toHaveValue(clusterProperties.HostPrefix);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test('Cluster updates', async ({ page, createOSDWizardPage }) => {
      await createOSDWizardPage.isClusterUpdatesScreen();
      await createOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
      await page.locator(createOSDWizardPage.primaryButton).click();
    });

    test('Review and create – exclude namespace selectors definitions', async ({
      createOSDWizardPage,
    }) => {
      await createOSDWizardPage.isReviewScreen();

      await expect(createOSDWizardPage.applicationIngressValue()).toContainText(
        clusterProperties.ApplicationIngress,
      );
      for (const reviewDisplay of clusterProperties.RouteSelector.ReviewDisplays) {
        await expect(createOSDWizardPage.routeSelectorsReviewValue()).toContainText(reviewDisplay);
      }
      for (const reviewDisplay of clusterProperties.ExcludedNamespaces.ReviewDisplays) {
        await expect(createOSDWizardPage.excludedNamespacesReviewValue()).toContainText(
          reviewDisplay,
        );
      }
      await expect(createOSDWizardPage.namespaceOwnershipPolicyReviewValue()).toHaveText(
        clusterProperties.NamespaceOwnershipPolicyReviewDisplay,
      );
      await expect(createOSDWizardPage.wildcardPolicyReviewValue()).toHaveText(
        clusterProperties.WildcardPolicyReviewDisplay,
      );

      await createOSDWizardPage.expectReviewLabelGroupDisplays(
        createOSDWizardPage.excludeNamespaceSelectorsReviewValue(),
        clusterProperties.ExcludeNamespaceSelectors.map((selector) => selector.ReviewDisplay),
      );
    });

    test('Cluster submission and installation progress', async ({
      createOSDWizardPage,
      clusterDetailsPage,
    }) => {
      await createOSDWizardPage.createClusterButton().click();
      await clusterDetailsPage.waitForInstallerScreenToLoad();

      await expect(clusterDetailsPage.clusterNameTitle()).toContainText(clusterName);
      await expect(clusterDetailsPage.clusterInstallationHeader()).toContainText(
        'Installing cluster',
      );

      await clusterDetailsPage.clusterDetailsPageRefresh();
      await clusterDetailsPage.checkInstallationStepStatus('Account setup');
      await clusterDetailsPage.checkInstallationStepStatus('Network settings');
      await clusterDetailsPage.checkInstallationStepStatus('DNS setup');
      await clusterDetailsPage.checkInstallationStepStatus('Cluster installation');
    });
  },
);
