import { expect, test } from '../../fixtures/pages';

const clusterProfiles = require('../../fixtures/osd-gcp/osd-ccs-gcp-custom-ingress.spec.json');
const ClustersValidation = require('../../fixtures/osd-gcp/osd-ccs-gcp-wizard-validation.spec.json');
const day1Profile = clusterProfiles['osd-gcp-ingress-public-advanced']['day1-profile'];
const clusterProperties = clusterProfiles['osd-gcp-ingress-public-advanced']['day2-profile'];
/** Prefer the Day-1 generated name (env) over the static fixture prefix. */
const clusterName =
  process.env.CLUSTER_NAME ||
  process.env.QE_CURATED_GCP_DAY2_CLUSTER_NAME ||
  day1Profile.ClusterName;
const ingressValidation =
  ClustersValidation.ClustersValidation.Networking.Configuration.Common.IngressSettings
    .CustomSettings;

test.describe.serial(
  `OSD GCP WIF custom ingress Networking Day-2 (${clusterName})`,
  { tag: ['@day2', '@osd', '@curated', '@gcp', '@networking', '@custom-ingress'] },
  () => {
    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      test.skip(
        !clusterName,
        'Set CLUSTER_NAME or QE_CURATED_GCP_DAY2_CLUSTER_NAME to the Day-1 cluster name.',
      );

      await navigateTo('clusters/list');
      await clusterListPage.waitForDataReady();
    });

    test('Navigate to cluster Networking tab', async ({
      clusterListPage,
      clusterDetailsPage,
      networkingPage,
    }) => {
      await clusterListPage.isClusterListScreen();
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await networkingPage.goToNetworkingTab();
    });

    test('Network configuration card shows CIDR ranges from cluster creation', async ({
      networkingPage,
    }) => {
      const card = networkingPage.networkConfigurationCard();
      await expect(card.getByText('CIDR ranges')).toBeVisible();

      await expect(networkingPage.descriptionListValue(card, 'Machine CIDR')).toHaveText(
        day1Profile.MachineCIDR,
      );
      await expect(networkingPage.descriptionListValue(card, 'Service CIDR')).toHaveText(
        day1Profile.ServiceCIDR,
      );
      await expect(networkingPage.descriptionListValue(card, 'Pod CIDR')).toHaveText(
        day1Profile.PodCIDR,
      );
      await expect(networkingPage.descriptionListValue(card, 'Host prefix')).toHaveText(
        day1Profile.HostPrefix,
      );
    });

    test('Application ingress card shows default router and ingress fields', async ({
      networkingPage,
    }) => {
      const card = networkingPage.applicationIngressCard();
      await expect(card.getByText('Application ingress', { exact: true })).toBeVisible();
      await expect(networkingPage.defaultApplicationRouterInput()).toBeVisible();
      await expect(networkingPage.routeSelectorDisplayInput()).toBeVisible();
      await expect(networkingPage.excludedNamespacesDisplayInput()).toBeVisible();
      await expect(networkingPage.editApplicationIngressButton()).toBeVisible();
    });

    test('Edit application ingress modal opens with Save disabled until values change', async ({
      networkingPage,
    }) => {
      await networkingPage.openEditApplicationIngressModal();
      await expect(networkingPage.editModalSaveButton()).toBeDisabled();
      await networkingPage.closeEditApplicationIngressModal();
    });

    test('Application ingress card and edit modal show day-1 custom ingress values', async ({
      networkingPage,
    }) => {
      const expectedIngress = clusterProperties.ApplicationIngress;

      await expect(networkingPage.routeSelectorDisplayInput()).toHaveValue(
        expectedIngress.RouteSelector,
      );
      await expect(networkingPage.excludedNamespacesDisplayInput()).toHaveValue(
        expectedIngress.ExcludedNamespaces,
      );

      const card = networkingPage.applicationIngressCard();
      if (expectedIngress.NamespaceOwnershipPolicy === 'Strict') {
        await expect(card.getByRole('switch', { name: 'Strict' })).toBeChecked();
      } else {
        await expect(card.getByRole('switch', { name: 'Strict' })).not.toBeChecked();
      }

      await networkingPage.openEditApplicationIngressModal();
      await expect(networkingPage.editModalRouteSelectorInput()).toHaveValue(
        expectedIngress.RouteSelector,
      );
      await expect(networkingPage.editModalExcludedNamespacesInput()).toHaveValue(
        expectedIngress.ExcludedNamespaces,
      );
      await networkingPage.closeEditApplicationIngressModal();
    });

    test('Edit application ingress - route selector field validations', async ({
      networkingPage,
    }) => {
      const routeSelectorValidation = ingressValidation.RouteSelector;

      await networkingPage.openEditApplicationIngressModal();

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage
        .editModalRouteSelectorInput()
        .fill(routeSelectorValidation[0].UpperCharacterLimitValue);
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[0].Error);

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage
        .editModalRouteSelectorInput()
        .fill(routeSelectorValidation[1].InvalidValue);
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[1].Error);

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage
        .editModalRouteSelectorInput()
        .fill(routeSelectorValidation[2].InvalidValue);
      await networkingPage.blurRouteSelectorField();
      await networkingPage.isTextContainsInPage(routeSelectorValidation[2].Error);

      await networkingPage.editModalRouteSelectorInput().clear();
      await networkingPage
        .editModalRouteSelectorInput()
        .fill(routeSelectorValidation[3].InvalidValue);
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

      await networkingPage.editModalExcludedNamespacesInput().clear();
      await networkingPage
        .editModalExcludedNamespacesInput()
        .fill(excludedNamespacesValidation[0].UpperCharacterLimitValue);
      await networkingPage.blurExcludedNamespacesField();
      await networkingPage.isTextContainsInPage(excludedNamespacesValidation[0].Error);

      await networkingPage.editModalExcludedNamespacesInput().clear();
      await networkingPage
        .editModalExcludedNamespacesInput()
        .fill(excludedNamespacesValidation[1].InvalidValue);
      await networkingPage.blurExcludedNamespacesField();
      await networkingPage.isTextContainsInPage(excludedNamespacesValidation[1].Error);

      await networkingPage.editModalExcludedNamespacesInput().clear();
      await networkingPage.editModalExcludedNamespacesInput().fill('abc-123');
      await networkingPage.blurExcludedNamespacesField();
      await networkingPage.isTextContainsInPage(excludedNamespacesValidation[1].Error, false);

      await networkingPage.closeEditApplicationIngressModal();
    });
  },
);
