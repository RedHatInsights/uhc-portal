import { test } from '../../fixtures/pages';
import { CLUSTER_LIST_ROUTE } from '../../support/playwright-constants';

const clusterProperties = require('../../fixtures/osd-gcp/osd-ccs-gcp-private-wif-psc-cluster-creation-advanced.spec.json');
const clusterNamePrefix = process.env.CLUSTER_NAME || clusterProperties.ClusterName;

test.describe.serial(
  'OSD GCP CCS WIF private PSC cluster delete tests',
  {
    tag: [
      '@advanced',
      '@day3',
      '@osd',
      '@ccs',
      '@gcp',
      '@private',
      '@wif',
      '@psc',
      '@multizone',
      '@delete',
    ],
  },
  () => {
    let clusterName: string;

    test(`Open OSD - ${clusterProperties.CloudProvider} Workload Identity Federation PrivateServiceConnect cluster`, async ({
      navigateTo,
      clusterListPage,
      clusterDetailsPage,
    }) => {
      await navigateTo(CLUSTER_LIST_ROUTE);
      await clusterListPage.waitForDataReady();
      await clusterListPage.filterTxtField().click();
      await clusterListPage.filterTxtField().clear();
      await clusterListPage.filterTxtField().fill(clusterNamePrefix);
      await clusterListPage.waitForDataReady();
      await clusterListPage.openClusterDefinition(clusterNamePrefix, 'startsWith');
      await clusterDetailsPage.waitForClusterDetailsLoad();
      await clusterDetailsPage.isClusterDetailsPage(clusterNamePrefix);
      clusterName = await clusterDetailsPage.clusterNameTitle().innerText();
    });

    test(`Delete OSD - ${clusterProperties.CloudProvider} Workload Identity Federation PrivateServiceConnect cluster`, async ({
      clusterDetailsPage,
    }) => {
      await clusterDetailsPage.deleteClusterByName(clusterName);
    });
  },
);
