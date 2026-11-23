import { expect, test } from '../../fixtures/pages';
import { getUsernameSuffix } from '../../support/auth-config';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const day1Profile = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.json');
const day2Fixture = require('../../fixtures/osd-gcp/osd-ondemand-gcp-wif-public-advanced-networking-tab.spec.json');

const QE_INFRA_GCP = JSON.parse(process.env.QE_INFRA_GCP || '{}');
const FIREWALL_RULES_NAME = QE_INFRA_GCP['FIREWALL_RULES_NAME'] || '';

/**
 * Day-2 Networking tab validation for the OSD On-Demand GCP WIF public advanced cluster
 * created by osd-ondemand-gcp-wif-public-advanced-cluster-creation.spec.ts.
 */
test.describe.serial(
  'OSD On-Demand GCP WIF public advanced - Networking tab validation',
  {
    tag: [
      '@day2',
      '@osd',
      '@gcp',
      '@wif',
      '@ondemand',
      '@public',
      '@advanced',
      '@networking',
      '@firewall',
    ],
  },
  () => {
    const clusterName =
      process.env.CLUSTER_NAME || `${day1Profile.ClusterName}-${getUsernameSuffix()}`;

    let domainPrefix = '';

    // Day-1 fixture stores ExcludeNamespaceSelectors as an array (multi-row).
    const day1ExcludeNamespaceSelectors = (
      day1Profile.ExcludeNamespaceSelectors as { Key: string; Values: string }[]
    ).map((selector) => ({
      key: selector.Key,
      values: selector.Values,
    }));
    const day1PrimaryExcludeNamespaceSelector = day1ExcludeNamespaceSelectors[0];

    // Shared by serial Day-1 asserts, restore, and afterAll cleanup.
    const day1IngressFields = {
      routeSelector: day1Profile.RouteSelector.KeyValue,
      excludedNamespaces: day1Profile.ExcludedNamespaces.Values,
      excludeNamespaceSelectors: day1ExcludeNamespaceSelectors,
    };

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      if (!FIREWALL_RULES_NAME?.trim()) {
        throw new Error('QE_INFRA_GCP.FIREWALL_RULES_NAME must be set for Day 2 firewall coverage');
      }
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('navigates to cluster and opens the Networking tab', async ({
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

    test('verifies CIDR ranges from Day-1 profile', async ({ networkingPage }) => {
      await networkingPage.expectNetworkingCidrRanges({
        MachineCIDR: day1Profile.MachineCIDR,
        ServiceCIDR: day1Profile.ServiceCIDR,
        PodCIDR: day1Profile.PodCIDR,
        Hostprefix: day1Profile.HostPrefix,
      });
    });

    test('verifies Firewall rules are shown under VPC details when set', async ({
      networkingPage,
    }) => {
      await expect(networkingPage.vpcDetailsCardTitle()).toBeVisible();
      await networkingPage.expectFirewallRulesValue(FIREWALL_RULES_NAME);
    });

    test('verifies Application ingress card shows Day-1 custom settings', async ({
      networkingPage,
    }) => {
      await expect(
        networkingPage.networkingTabPanel().getByText('Application ingress', { exact: true }),
      ).toBeVisible();
      await expect(networkingPage.defaultApplicationRouterInput()).toHaveValue(
        networkingPage.osdApplicationRouterPattern(domainPrefix),
      );
      await expect(
        networkingPage.applicationRouterPrivacyLabel(day1Profile.ClusterPrivacy),
      ).toBeVisible();
      await networkingPage.expectApplicationIngressCardValues(day1IngressFields);
      await expect(networkingPage.editApplicationIngressButton()).toBeEnabled();
    });

    test('opens Edit application ingress modal and verifies Day-1 values', async ({
      networkingPage,
    }) => {
      await networkingPage.openEditApplicationIngressModal();
      await expect(
        networkingPage.editApplicationIngressModal().getByText('Default application router'),
      ).toBeVisible();
      await expect(networkingPage.editApplicationIngressRouterInput()).toHaveValue(
        networkingPage.osdApplicationRouterPattern(domainPrefix),
      );
      await expect(networkingPage.editApplicationIngressRouteSelectorInput()).toHaveValue(
        day1IngressFields.routeSelector,
      );
      await expect(networkingPage.editApplicationIngressExcludedNamespacesInput()).toHaveValue(
        day1IngressFields.excludedNamespaces,
      );
      await expect(networkingPage.excludeNamespaceSelectorKeyInputs()).toHaveCount(
        day1ExcludeNamespaceSelectors.length,
      );
      await Promise.all(
        day1ExcludeNamespaceSelectors.map(async (selector, i) => {
          await expect(
            networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput(i),
          ).toHaveValue(selector.key);
          await expect(
            networkingPage.editApplicationIngressExcludeNamespaceSelectorValuesInput(i),
          ).toHaveValue(selector.values);
        }),
      );
    });

    test('validates Route selector field errors in Edit application ingress', async ({
      networkingPage,
    }) => {
      const routeSelectorCases = day2Fixture.NetworkingValidation.RouteSelector;
      await expect(networkingPage.editApplicationIngressModal()).toBeVisible();

      await networkingPage
        .editApplicationIngressRouteSelectorInput()
        .fill(routeSelectorCases[0].UpperCharacterLimitValue);
      await networkingPage.editApplicationIngressExcludedNamespacesInput().click();
      await networkingPage.isTextContainsInPage(routeSelectorCases[0].Error);

      await networkingPage
        .editApplicationIngressRouteSelectorInput()
        .fill(routeSelectorCases[1].InvalidValue);
      await networkingPage.editApplicationIngressExcludedNamespacesInput().click();
      await networkingPage.isTextContainsInPage(routeSelectorCases[1].Error);

      await networkingPage
        .editApplicationIngressRouteSelectorInput()
        .fill(routeSelectorCases[2].ValidValue);
      await networkingPage.editApplicationIngressExcludedNamespacesInput().click();
      await networkingPage.isTextContainsInPage(routeSelectorCases[0].Error, false);
      await networkingPage.isTextContainsInPage(routeSelectorCases[1].Error, false);
    });

    test('validates Excluded namespaces field errors in Edit application ingress', async ({
      networkingPage,
    }) => {
      const excludedNamespacesCases = day2Fixture.NetworkingValidation.ExcludedNamespaces;
      await expect(networkingPage.editApplicationIngressModal()).toBeVisible();

      await networkingPage
        .editApplicationIngressExcludedNamespacesInput()
        .fill(excludedNamespacesCases[0].UpperCharacterLimitValue);
      await networkingPage.editApplicationIngressRouteSelectorInput().click();
      await networkingPage.isTextContainsInPage(excludedNamespacesCases[0].Error);

      await networkingPage
        .editApplicationIngressExcludedNamespacesInput()
        .fill(excludedNamespacesCases[1].InvalidValue);
      await networkingPage.editApplicationIngressRouteSelectorInput().click();
      await networkingPage.isTextContainsInPage(excludedNamespacesCases[1].Error);

      await networkingPage
        .editApplicationIngressExcludedNamespacesInput()
        .fill(excludedNamespacesCases[2].ValidValue);
      await networkingPage.editApplicationIngressRouteSelectorInput().click();
      await networkingPage.isTextContainsInPage(excludedNamespacesCases[0].Error, false);
      await networkingPage.isTextContainsInPage(excludedNamespacesCases[1].Error, false);
    });

    test('validates Exclude namespace selectors field errors in Edit application ingress', async ({
      networkingPage,
    }) => {
      const excludeNamespaceSelectorCases =
        day2Fixture.NetworkingValidation.ExcludeNamespaceSelectors;
      const keyCases = excludeNamespaceSelectorCases.Key;
      const valueCases = excludeNamespaceSelectorCases.Values;
      const protectedError = valueCases[2].Error;

      await expect(networkingPage.editApplicationIngressModal()).toBeVisible();

      await networkingPage
        .editApplicationIngressExcludeNamespaceSelectorKeyInput()
        .fill(keyCases[0].InvalidValue);
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorValuesInput().click();
      await networkingPage.expectTextInEditApplicationIngressModal(keyCases[0].Error);

      await networkingPage
        .editApplicationIngressExcludeNamespaceSelectorKeyInput()
        .fill(keyCases[1].UpperCharacterLimitValue);
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorValuesInput().click();
      await networkingPage.expectTextInEditApplicationIngressModal(keyCases[1].Error);

      await networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput().fill('');
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorValuesInput().fill('prod');
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput().click();
      await networkingPage.expectTextInEditApplicationIngressModal(
        valueCases[1].ValueBeforeKeyError,
      );

      await networkingPage
        .editApplicationIngressExcludeNamespaceSelectorKeyInput()
        .fill(day1PrimaryExcludeNamespaceSelector.key);
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorValuesInput().fill('');
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput().click();
      await networkingPage.expectTextInEditApplicationIngressModal(valueCases[0].EmptyWithKeyError);

      await networkingPage
        .editApplicationIngressExcludeNamespaceSelectorValuesInput()
        .fill(valueCases[2].InvalidValue);
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput().click();
      await networkingPage.expectTextInEditApplicationIngressModal(protectedError);

      await networkingPage
        .editApplicationIngressExcludeNamespaceSelectorValuesInput()
        .fill(valueCases[3].InvalidValue);
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput().click();
      await networkingPage.expectTextInEditApplicationIngressModal(protectedError);

      await networkingPage
        .editApplicationIngressExcludeNamespaceSelectorValuesInput()
        .fill(valueCases[4].InvalidValue);
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput().click();
      await networkingPage.expectTextInEditApplicationIngressModal(protectedError);

      // Validation cases only need a single known-good row; trim extras from Day-1.
      await networkingPage.setExcludeNamespaceSelectors([day1PrimaryExcludeNamespaceSelector]);
      await networkingPage.addExcludeNamespaceSelectorRow({
        key: day1PrimaryExcludeNamespaceSelector.key,
        values: 'duplicate-value',
      });
      await networkingPage.editApplicationIngressExcludeNamespaceSelectorKeyInput(0).click();
      await networkingPage.expectTextInEditApplicationIngressModal(
        excludeNamespaceSelectorCases.DuplicateKeyError,
        true,
        2,
      );

      await networkingPage.removeExcludeNamespaceSelectorButton(1).click();
      await networkingPage.fillExcludeNamespaceSelectorRow(0, day1PrimaryExcludeNamespaceSelector);
      await networkingPage.expectTextInEditApplicationIngressModal(protectedError, false);
      await networkingPage.expectTextInEditApplicationIngressModal(
        excludeNamespaceSelectorCases.DuplicateKeyError,
        false,
      );
    });

    test('cancels Edit application ingress without saving', async ({ networkingPage }) => {
      await networkingPage.cancelNetworkingModal();
      await networkingPage.expectApplicationIngressCardValues(day1IngressFields);
    });

    test('edits application ingress and saves Day-2 values', async ({ networkingPage }) => {
      const editIngress = day2Fixture.EditApplicationIngress;
      const day2EditIngressFields = {
        routeSelector: editIngress.RouteSelector.KeyValue,
        excludedNamespaces: editIngress.ExcludedNamespaces.Values,
        excludeNamespaceSelectors: [
          {
            key: editIngress.ExcludeNamespaceSelectors.Key,
            values: editIngress.ExcludeNamespaceSelectors.Values,
          },
        ],
      };

      await networkingPage.saveApplicationIngressFields(day2EditIngressFields);
      await networkingPage.expectApplicationIngressCardValues(day2EditIngressFields);
    });

    test('adds a second Exclude namespace selector and saves', async ({ networkingPage }) => {
      const editIngress = day2Fixture.EditApplicationIngress;
      const secondExcludeNamespaceSelector =
        day2Fixture.NetworkingValidation.ExcludeNamespaceSelectors.SecondSelector;
      const day2ExcludeNamespaceSelectors = [
        {
          key: editIngress.ExcludeNamespaceSelectors.Key,
          values: editIngress.ExcludeNamespaceSelectors.Values,
        },
      ];

      await networkingPage.openEditApplicationIngressModal();
      await networkingPage.addExcludeNamespaceSelectorRow({
        key: secondExcludeNamespaceSelector.Key,
        values: secondExcludeNamespaceSelector.Values,
      });
      await expect(networkingPage.networkingModalSaveButton()).toBeEnabled();
      await networkingPage.saveNetworkingModal();
      await networkingPage.expectExcludeNamespaceSelectorsCard([
        ...day2ExcludeNamespaceSelectors,
        {
          key: secondExcludeNamespaceSelector.Key,
          values: secondExcludeNamespaceSelector.Values,
        },
      ]);
    });

    test('removes the second Exclude namespace selector and saves', async ({ networkingPage }) => {
      const editIngress = day2Fixture.EditApplicationIngress;
      const day2ExcludeNamespaceSelectors = [
        {
          key: editIngress.ExcludeNamespaceSelectors.Key,
          values: editIngress.ExcludeNamespaceSelectors.Values,
        },
      ];

      await networkingPage.openEditApplicationIngressModal();
      await networkingPage.removeExcludeNamespaceSelectorButton(1).click();
      await expect(networkingPage.networkingModalSaveButton()).toBeEnabled();
      await networkingPage.saveNetworkingModal();
      await networkingPage.expectExcludeNamespaceSelectorsCard(day2ExcludeNamespaceSelectors);
    });

    test('clears Exclude namespace selectors and saves', async ({ networkingPage }) => {
      await networkingPage.openEditApplicationIngressModal();
      await networkingPage.setExcludeNamespaceSelectors([]);
      await expect(networkingPage.networkingModalSaveButton()).toBeEnabled();
      await networkingPage.saveNetworkingModal();
      await networkingPage.expectExcludeNamespaceSelectorsCard([]);
    });

    test('restores Day-1 fixture values on application ingress', async ({ networkingPage }) => {
      await networkingPage.saveApplicationIngressFields(day1IngressFields);
      await networkingPage.expectApplicationIngressCardValues(day1IngressFields);
      await networkingPage.expectExcludeNamespaceSelectorsCard(day1ExcludeNamespaceSelectors);
    });

    test.afterAll(async ({ networkingPage }) => {
      try {
        await networkingPage.dismissNetworkingModalIfOpen();
        if (
          !(await networkingPage
            .editApplicationIngressButton()
            .isVisible()
            .catch(() => false))
        ) {
          return;
        }
        try {
          await networkingPage.expectApplicationIngressCardValues(day1IngressFields);
        } catch {
          await networkingPage.saveApplicationIngressFields(day1IngressFields);
          await networkingPage.expectApplicationIngressCardValues(day1IngressFields);
        }
      } catch (error) {
        console.error(
          'afterAll: failed to restore Day-1 application ingress values on Networking tab',
          error,
        );
        throw error;
      }
    });
  },
);
