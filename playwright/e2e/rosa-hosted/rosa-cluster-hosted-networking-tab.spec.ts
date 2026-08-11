import { test, expect } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProfiles = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const validationFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-wizard-validation.spec.json');

const day1Profile = clusterProfiles['rosa-hosted-public-advanced']['day1-profile'];
const cidrRanges = day1Profile.networking.CIDRRanges;
const clusterProxy = day1Profile.ClusterProxy;
const clusterPrivacy = day1Profile.ClusterPrivacy;
const proxyValidation = validationFixture.Networking.ClusterProxy;

/**
 * Day-2 Networking tab coverage for the ROSA HCP public advanced cluster created by
 * rosa-cluster-hosted-public-advanced-creation.spec.ts (same fixture).
 */
test.describe.serial(
  'ROSA HCP Day2 - Networking tab',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@hcp', '@networking', '@advanced', '@public'] },
  () => {
    const clusterName =
      process.env.CLUSTER_NAME || `${day1Profile.ClusterName}-${getUsernameSuffix()}`;
    let domainPrefix = '';

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('Navigate to cluster and open the Networking tab', async ({
      clusterListPage,
      clusterDetailsPage,
      networkingPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
      domainPrefix = await clusterDetailsPage.getDomainPrefix();
      expect(domainPrefix).toBeTruthy();
      await networkingPage.navigateToNetworkingTab();
    });

    test('Verify CIDR ranges from Day-1 profile', async ({ networkingPage }) => {
      await networkingPage.expectNetworkingCidrRanges(cidrRanges);
    });

    test('Verify Cluster ingress card shows Public API and edit is available', async ({
      networkingPage,
    }) => {
      await expect(
        networkingPage.networkingTabPanel().getByText('Cluster ingress', { exact: true }),
      ).toBeVisible();
      await expect(
        networkingPage.networkingTabPanel().getByText('Cluster console URL', { exact: true }),
      ).toBeVisible();
      await expect(networkingPage.networkingConsoleUrlClipboard()).toHaveValue(
        networkingPage.networkingConsoleUrlWithDomainPrefixPattern(domainPrefix),
      );
      await expect(networkingPage.networkingOpenConsoleLink()).toBeVisible();
      await expect(networkingPage.networkingOpenConsoleLink()).toHaveAttribute(
        'href',
        networkingPage.networkingConsoleUrlWithDomainPrefixPattern(domainPrefix),
      );
      await expect(
        networkingPage
          .networkingTabPanel()
          .getByText('Control Plane API endpoint', { exact: true }),
      ).toBeVisible();
      await expect(networkingPage.networkingControlPlaneApiEndpointClipboard()).toHaveValue(
        networkingPage.networkingApiEndpointWithDomainPrefixPattern(domainPrefix),
      );
      await expect(networkingPage.apiPrivacyLabel(clusterPrivacy)).toBeVisible();
      await expect(networkingPage.editClusterIngressButton()).toBeEnabled();
    });

    test('Verify Application ingress card shows Public router', async ({ networkingPage }) => {
      await expect(
        networkingPage.networkingTabPanel().getByText('Application ingress', { exact: true }),
      ).toBeVisible();
      await expect(networkingPage.defaultApplicationRouterInput()).toHaveValue(
        networkingPage.applicationRouterCardPattern(domainPrefix),
      );
      await expect(networkingPage.applicationRouterPrivacyLabel(clusterPrivacy)).toBeVisible();
      await expect(networkingPage.editApplicationIngressButton()).toBeVisible();
    });

    test('Verify VPC subnets and Cluster-wide proxy section', async ({ networkingPage }) => {
      await expect(networkingPage.networkingTabPanel().getByText(/VPC subnets/)).toBeVisible();
      await expect(
        networkingPage
          .networkingTabPanel()
          .getByRole('heading', { name: 'Virtual Private Cloud (VPC)' }),
      ).toBeVisible();
      await networkingPage.scrollToClusterWideProxySection();
      await expect(networkingPage.clusterWideProxyHeading()).toBeVisible();
      await expect(networkingPage.httpProxyUrlTerm()).toBeVisible();
      await expect(networkingPage.httpsProxyUrlTerm()).toBeVisible();
      // Day-1 creates with ClusterWideProxy Disabled
      await networkingPage.expectHttpProxyUrl('N/A');
      await expect(networkingPage.editClusterWideProxyButton()).toBeEnabled();
    });

    test('Open Edit application ingress modal and cancel', async ({ networkingPage }) => {
      await networkingPage.openEditApplicationIngressModal();
      await expect(
        networkingPage.editApplicationIngressModal().getByText('Default application router'),
      ).toBeVisible();
      await expect(networkingPage.editApplicationIngressRouterInput()).toHaveValue(
        networkingPage.applicationRouterEditModalPattern(domainPrefix),
      );
      await networkingPage.cancelNetworkingModal();
    });

    test('Validate Edit cluster-wide proxy form field errors', async ({ networkingPage }) => {
      await networkingPage.openEditClusterWideProxyModal();

      await expect(networkingPage.clusterWideProxyLearnMoreLink()).toBeVisible();
      await expect(
        networkingPage
          .editClusterWideProxyModal()
          .getByText('Configure at least 1 of the following fields:'),
      ).toBeVisible();

      await networkingPage.httpProxyUrlInput().fill(proxyValidation.InvalidHttpProxyValue);
      await networkingPage.httpsProxyUrlInput().click();
      await networkingPage.isTextContainsInPage(proxyValidation.InvalidHttpProxyError);

      await networkingPage.httpProxyUrlInput().clear();
      await networkingPage.httpProxyUrlInput().fill(proxyValidation.InvalidHttpProxyUrlValue);
      await networkingPage.httpsProxyUrlInput().click();
      await networkingPage.isTextContainsInPage(proxyValidation.InvalidHttpProxyUrlError);

      await networkingPage.httpProxyUrlInput().clear();
      await networkingPage.httpsProxyUrlInput().fill(proxyValidation.InvalidHttpsProxyValue);
      await networkingPage.httpProxyUrlInput().click();
      await networkingPage.isTextContainsInPage(proxyValidation.InvalidHttpsProxyError);

      await networkingPage.cancelNetworkingModal();
    });

    test('Fill valid cluster-wide proxy values and cancel without saving', async ({
      networkingPage,
    }) => {
      await networkingPage.openEditClusterWideProxyModal();
      await networkingPage.httpProxyUrlInput().fill(clusterProxy.HttpProxy);
      await networkingPage.httpsProxyUrlInput().fill(clusterProxy.HttpsProxy);
      await networkingPage.noProxyDomainsInput().fill(clusterProxy.NoProxyDomains);
      await expect(networkingPage.networkingModalSaveButton()).toBeEnabled();
      await networkingPage.cancelNetworkingModal();
      await networkingPage.scrollToClusterWideProxySection();
      await networkingPage.expectHttpProxyUrl('N/A');
    });

    test('Verify Edit cluster ingress modal properties', async ({ networkingPage }) => {
      await networkingPage.openEditClusterIngressModal();
      await expect(networkingPage.editClusterIngressPrivacyWarning()).toBeVisible();
      await expect(networkingPage.editClusterIngressPrivacyLearnMoreLink()).toBeVisible();
      await expect(
        networkingPage.editClusterIngressModal().getByText('Control Plane API endpoint'),
      ).toBeVisible();
      await expect(networkingPage.editClusterIngressApiEndpointClipboard()).toHaveValue(
        networkingPage.networkingApiEndpointWithDomainPrefixPattern(domainPrefix),
      );
      await expect(networkingPage.makeApiPrivateCheckbox()).not.toBeChecked();
      await expect(networkingPage.networkingModalSaveButton()).toBeDisabled();
      await networkingPage.cancelNetworkingModal();
    });

    test('Edit cluster ingress - toggle API privacy private then restore to public', async ({
      networkingPage,
    }) => {
      await networkingPage.setApiPrivacy(true);
      await expect(networkingPage.apiPrivacyLabel('Private')).toBeVisible({ timeout: 60000 });
      await networkingPage.setApiPrivacy(false);
      await expect(networkingPage.apiPrivacyLabel(clusterPrivacy)).toBeVisible({
        timeout: 60000,
      });
    });

    test.afterAll(async ({ networkingPage }) => {
      try {
        await networkingPage.dismissNetworkingModalIfOpen();
        await networkingPage.navigateToNetworkingTab();
        await networkingPage.ensureApiPrivacy(false);
      } catch (error) {
        console.error('afterAll: failed to restore Day-1 API privacy on Networking tab', error);
        throw error;
      }
    });
  },
);
