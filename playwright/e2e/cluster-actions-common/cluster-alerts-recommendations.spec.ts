import { test, expect } from '../../fixtures/pages';

const clusterProfileFixture = require('../../fixtures/rosa-hosted/rosa-cluster-hosted-public-advanced-creation.spec.json');
const recommendedOperatorsFixture = require('../../fixtures/cluster-actions-common/cluster-alerts-recommendations.spec.json');

const creationProfile = clusterProfileFixture['rosa-hosted-public-advanced']['day1-profile'];
const expectedOperators = recommendedOperatorsFixture.expectedOperators;

test.describe.serial(
  'Cluster details - Recommended operators alert and drawer functionality',
  { tag: ['@day2', '@rosa-hosted', '@rosa', '@hcp', '@advanced', '@recommended-operators'] },
  () => {
    const clusterName = process.env.CLUSTER_NAME || creationProfile.ClusterName;

    test.beforeAll(async ({ navigateTo, clusterListPage }) => {
      await navigateTo('cluster-list');
      await clusterListPage.waitForDataReady();
      await clusterListPage.isClusterListScreen();
    });

    test('Navigate to ROSA HCP cluster details page', async ({
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await clusterListPage.filterTxtField().fill(clusterName);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterName);
      await clusterDetailsPage.isClusterDetailsPage(clusterName);
    });

    test('Alerts and recommendations section is visible and can be expanded', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.alertsAndRecommendationsToggle()).toBeVisible({
        timeout: 30000,
      });
      await clusterDetailsPage.expandAlertsAndRecommendations();
    });

    test('Identity provider hint alert is visible when no IDPs are configured', async ({
      clusterDetailsPage,
      identityProvidersPage,
    }) => {
      const hasIdps = await identityProvidersPage.hasConfiguredIdps();

      await clusterDetailsPage.navigateToOverviewTab();
      await clusterDetailsPage.expandAlertsAndRecommendations();

      if (!hasIdps) {
        await expect(clusterDetailsPage.idpHintAlert()).toBeVisible({ timeout: 10000 });
        await expect(clusterDetailsPage.idpHintDescription()).toBeVisible();
        await expect(clusterDetailsPage.createIdentityProviderButton()).toBeVisible();
      } else {
        await expect(clusterDetailsPage.idpHintAlert()).toBeHidden();
      }
    });

    test('Recommended operators alert is visible with correct title', async ({
      clusterDetailsPage,
    }) => {
      await expect(clusterDetailsPage.recommendedOperatorsAlert()).toBeVisible({ timeout: 30000 });
    });

    test('Recommended operators expand toggle is present', async ({ clusterDetailsPage }) => {
      await expect(clusterDetailsPage.recommendedOperatorsExpandToggle()).toBeVisible();
      await expect(clusterDetailsPage.recommendedOperatorsExpandToggle()).toHaveText(
        /Show recommended operators/,
      );
    });

    test('Can expand recommended operators section and see product cards', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.expandRecommendedOperators();
      await expect(clusterDetailsPage.recommendedOperatorsExpandToggle()).toHaveText(
        /Hide recommended operators/,
      );
      await expect(clusterDetailsPage.allProductCards()).toHaveCount(
        recommendedOperatorsFixture.totalOperatorCards,
      );
    });

    test('Featured product cards are displayed with correct names', async ({
      clusterDetailsPage,
    }) => {
      for (const product of expectedOperators.featuredProducts) {
        await expect(clusterDetailsPage.productCard(product)).toBeVisible();
      }
    });

    test('Recommended operator cards are displayed with correct names', async ({
      clusterDetailsPage,
    }) => {
      for (const operator of expectedOperators.recommendedOperators) {
        await expect(clusterDetailsPage.productCard(operator)).toBeVisible();
      }
    });

    test('Each product card has a Learn more button', async ({ clusterDetailsPage }) => {
      const allProducts = [
        ...expectedOperators.featuredProducts,
        ...expectedOperators.recommendedOperators,
      ];
      for (const product of allProducts) {
        await expect(clusterDetailsPage.productCardLearnMoreButton(product)).toBeVisible();
      }
    });

    test('Can open drawer by clicking Learn more on a featured product', async ({
      clusterDetailsPage,
    }) => {
      const firstProduct = expectedOperators.featuredProducts[0];
      await clusterDetailsPage.openProductDrawer(firstProduct);
      await expect(clusterDetailsPage.drawerCloseButton()).toBeVisible();
    });

    test('Can close the drawer using the close button', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.closeDrawer();
      await expect(clusterDetailsPage.drawerCloseButton()).toBeHidden();
    });

    test('Can open drawer for a different operator and verify it switches', async ({
      clusterDetailsPage,
    }) => {
      const firstProduct = expectedOperators.featuredProducts[0];
      const secondProduct = expectedOperators.featuredProducts[1];

      await clusterDetailsPage.openProductDrawer(firstProduct);
      await expect(clusterDetailsPage.drawerProductHeading(firstProduct)).toBeVisible();

      await clusterDetailsPage.productCardLearnMoreButton(secondProduct).click();
      await expect(clusterDetailsPage.drawerProductHeading(secondProduct)).toBeVisible();

      await clusterDetailsPage.closeDrawer();
    });

    test('Drawer closes when collapsing recommended operators section', async ({
      clusterDetailsPage,
    }) => {
      const firstProduct = expectedOperators.featuredProducts[0];
      await clusterDetailsPage.expandRecommendedOperators();
      await clusterDetailsPage.openProductDrawer(firstProduct);
      await expect(clusterDetailsPage.drawerCloseButton()).toBeVisible();

      await clusterDetailsPage.collapseRecommendedOperators();
      await expect(clusterDetailsPage.drawerCloseButton()).toBeHidden();
    });

    test('Can re-expand section after collapsing', async ({ clusterDetailsPage }) => {
      await clusterDetailsPage.expandRecommendedOperators();
      await expect(clusterDetailsPage.allProductCards()).toHaveCount(
        recommendedOperatorsFixture.totalOperatorCards,
      );
    });

    test('Dismissing alert hides the recommended operators section', async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.dismissRecommendedOperatorsAlert();
      await expect(clusterDetailsPage.recommendedOperatorsAlert()).toBeHidden();
      await expect(clusterDetailsPage.recommendedOperatorsExpandToggle()).toBeHidden();
    });
  },
);
