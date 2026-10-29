import clustersValidation from '../../fixtures/osd-gcp/osd-ccs-gcp-wizard-validation.spec.json';
import clusterProperties from '../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.json';
import { test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

// Day-1 cluster created by osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.ts.
/** Mirrors the Day-1 spec's name derivation; override via CLUSTER_NAME if needed. */
const clusterName =
  process.env.CLUSTER_NAME || `${clusterProperties.ClusterName}-${getUsernameSuffix()}`;
const ingressValidation =
  clustersValidation.ClustersValidation.Networking.Configuration.Common.IngressSettings
    .CustomSettings;

test.describe.serial(
  `OSD GCP WIF custom ingress Networking Day-2 (${clusterName})`,
  { tag: ['@day2', '@osd', '@gcp', '@networking', '@custom-ingress', '@advanced'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
    });

    test('Navigate to cluster Networking tab', async ({
      clusterListPage,
      clusterDetailsPage,
      networkingPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await networkingPage.goToNetworkingTab();
    });

    test('Network configuration card shows CIDR ranges from cluster creation', async ({
      networkingPage,
    }) => {
      await networkingPage.expectNetworkingCidrRanges({
        MachineCIDR: clusterProperties.MachineCIDR,
        ServiceCIDR: clusterProperties.ServiceCIDR,
        PodCIDR: clusterProperties.PodCIDR,
        Hostprefix: clusterProperties.HostPrefix,
      });
    });

    test('Application ingress card shows default router and ingress fields', async ({
      networkingPage,
    }) => {
      await networkingPage.scrollToApplicationIngressSection();
      await networkingPage.expectApplicationIngressRouteSelectorCardVisible();
      await networkingPage.expectApplicationIngressExcludedNamespacesCardVisible();
      await networkingPage.expectEditApplicationIngressButtonVisible();
    });

    test('Edit application ingress modal opens with Save disabled until values change', async ({
      networkingPage,
    }) => {
      await networkingPage.openEditApplicationIngressModal();
      await networkingPage.expectEditApplicationIngressModalSaveDisabled();
      await networkingPage.closeEditApplicationIngressModal();
    });

    test('Application ingress card and edit modal show custom ingress values', async ({
      networkingPage,
    }) => {
      await networkingPage.scrollToApplicationIngressSection();
      await networkingPage.expectApplicationIngressRouteSelectorCardValue(
        clusterProperties.RouteSelector.KeyValue,
      );
      await networkingPage.expectApplicationIngressExcludedNamespacesCardValue(
        clusterProperties.ExcludedNamespaces.Values,
      );
      await networkingPage.expectApplicationIngressNamespaceOwnershipPolicy(
        clusterProperties.NamespaceOwnershipPolicy,
      );
      await networkingPage.expectApplicationIngressWildcardPolicy(clusterProperties.WildcardPolicy);

      await networkingPage.openEditApplicationIngressModal();
      await networkingPage.expectEditApplicationIngressModalRouteSelectorValue(
        clusterProperties.RouteSelector.KeyValue,
      );
      await networkingPage.expectEditApplicationIngressModalExcludedNamespacesValue(
        clusterProperties.ExcludedNamespaces.Values,
      );
      await networkingPage.closeEditApplicationIngressModal();
    });

    test('Edit application ingress - route selector field validations', async ({
      networkingPage,
    }) => {
      const routeSelectorValidation = ingressValidation.RouteSelector;

      await networkingPage.openEditApplicationIngressModal();

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage.editModalRouteSelectorInput().fill(routeSelectorValidation[0].Value);
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[0].Error);

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage.editModalRouteSelectorInput().fill(routeSelectorValidation[1].Value);
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[1].Error);

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage.editModalRouteSelectorInput().fill(routeSelectorValidation[2].Value);
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[2].Error);

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage.editModalRouteSelectorInput().fill(routeSelectorValidation[3].Value);
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[3].Error);

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage.editModalRouteSelectorInput().fill('valid123-k.com/Hello_world2');
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[0].Error, false);

      await networkingPage.closeEditApplicationIngressModal();
    });

    test('Edit application ingress - excluded namespaces field validations', async ({
      networkingPage,
    }) => {
      const excludedNamespacesValidation = ingressValidation.ExcludedNamespaces;

      await networkingPage.openEditApplicationIngressModal();

      await networkingPage
        .editModalExcludedNamespacesInput()
        .fill(excludedNamespacesValidation[0].Value);
      await networkingPage.blurExcludedNamespacesField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        excludedNamespacesValidation[0].Error,
      );

      await networkingPage
        .editModalExcludedNamespacesInput()
        .fill(excludedNamespacesValidation[1].Value);
      await networkingPage.blurExcludedNamespacesField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        excludedNamespacesValidation[1].Error,
      );

      await networkingPage.editModalExcludedNamespacesInput().fill('abc-123');
      await networkingPage.blurExcludedNamespacesField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        excludedNamespacesValidation[0].Error,
        false,
      );
      await networkingPage.expectTextInEditApplicationIngressModal(
        excludedNamespacesValidation[1].Error,
        false,
      );

      await networkingPage.closeEditApplicationIngressModal();
    });

    test('Edit application ingress - TLS secret name and Hostname field validations', async ({
      networkingPage,
    }) => {
      const tlsValidation = ingressValidation.TlsSecretAndHostname;
      const label64Hostname = `${'a'.repeat(64)}.example.com`;
      const hostname225 = `${'a'.repeat(63)}.${'a'.repeat(63)}.${'a'.repeat(63)}.${'a'.repeat(33)}`;
      const hostname226 = `${'a'.repeat(63)}.${'a'.repeat(63)}.${'a'.repeat(63)}.${'a'.repeat(34)}`;

      await networkingPage.openEditApplicationIngressModal();

      await networkingPage.editApplicationIngressHostnameInput().fill(tlsValidation.ValidHostname);
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(tlsValidation.PairError);

      await networkingPage.editApplicationIngressHostnameInput().clear();
      await networkingPage.editApplicationIngressTlsSecretInput().fill(tlsValidation.ValidSecret);
      await networkingPage.blurTlsSecretField();
      await networkingPage.expectTextInEditApplicationIngressModal(tlsValidation.PairError);

      await networkingPage
        .editApplicationIngressHostnameInput()
        .fill(tlsValidation.InvalidHostnameFormat.Value);
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.InvalidHostnameFormat.Error,
      );

      await networkingPage
        .editApplicationIngressHostnameInput()
        .fill(tlsValidation.SingleLabelHostname.Value);
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.SingleLabelHostname.Error,
      );

      await networkingPage.editApplicationIngressHostnameInput().fill(label64Hostname);
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(tlsValidation.LabelLengthError);

      await networkingPage.editApplicationIngressHostnameInput().fill(hostname226);
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.HostnameLengthError,
      );

      await networkingPage.editApplicationIngressHostnameInput().fill(hostname225);
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.HostnameLengthError,
        false,
      );

      await networkingPage
        .editApplicationIngressHostnameInput()
        .fill(tlsValidation.DigitLeadingHostname);
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.InvalidHostnameFormat.Error,
        false,
      );
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.SingleLabelHostname.Error,
        false,
      );
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.LabelLengthError,
        false,
      );
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.HostnameLengthError,
        false,
      );
      await networkingPage.expectTextInEditApplicationIngressModal(tlsValidation.PairError, false);

      await networkingPage
        .editApplicationIngressTlsSecretInput()
        .fill(tlsValidation.InvalidSecret.Value);
      await networkingPage.editApplicationIngressHostnameInput().fill(tlsValidation.ValidHostname);
      await networkingPage.blurTlsSecretField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.InvalidSecret.Error,
      );

      await networkingPage.editApplicationIngressTlsSecretInput().fill(tlsValidation.DottedSecret);
      await networkingPage.blurTlsSecretField();
      await networkingPage.expectTextInEditApplicationIngressModal(
        tlsValidation.InvalidSecret.Error,
        false,
      );
      await networkingPage.expectTextInEditApplicationIngressModal(tlsValidation.PairError, false);

      await networkingPage.editApplicationIngressTlsSecretInput().clear();
      await networkingPage.editApplicationIngressHostnameInput().clear();
      await networkingPage.blurTlsHostnameField();
      await networkingPage.expectTextInEditApplicationIngressModal(tlsValidation.PairError, false);

      await networkingPage.closeEditApplicationIngressModal();
    });
  },
);
