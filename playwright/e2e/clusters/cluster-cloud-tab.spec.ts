import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ClusterCloudTabPage } from '../../page-objects/cluster-cloud-tab-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';

// Description text constants
const OSDDescriptionText = 'A complete OpenShift cluster provided as a fully-managed cloud service';
const AzureDescriptionText =
  'A flexible, self-service deployment of OpenShift clusters provided as a fully-managed cloud service by Microsoft and Red Hat';
const IBMDescriptionText =
  'A preconfigured OpenShift environment provided as a fully-managed cloud service at enterprise scale';
const ROSADescriptionText =
  'Build, deploy, and manage Kubernetes applications with Red Hat OpenShift running natively on AWS';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let clusterCloudTabPage: ClusterCloudTabPage;

test.describe(
  'Test checking elements at create cluster page, in Cloud tab selected - OCP-38888',
  { tag: ['@smoke'] },
  () => {
    test.beforeAll(async ({ browser }) => {
      // Setup: auth + navigate to cloud create page
      const setup = await setupTestSuite(browser, 'create/cloud');

      sharedContext = setup.context;
      sharedPage = setup.page;

      // Initialize page objects for this test suite
      clusterCloudTabPage = new ClusterCloudTabPage(sharedPage);

      await clusterCloudTabPage.isCloudTabPage();
    });

    test.afterAll(async () => {
      await cleanupTestSuite(sharedContext);
    });

    test('is Cloud tab selected', async () => {
      await clusterCloudTabPage.isCloudTabPage();
    });

    test('should display correct breadcrumbs', async () => {
      await clusterCloudTabPage.checkBreadcrumbs();
    });

    test('Checks OSD Trial section contents', async () => {
      await clusterCloudTabPage.checkMainHeader();

      await clusterCloudTabPage.checkManagedServiceLink(
        'Red Hat OpenShift Dedicated Trial',
        'https://cloud.redhat.com/products/dedicated/',
      );

      await clusterCloudTabPage.checkManagedServiceButton(
        'Create trial cluster',
        '/openshift/create/osdtrial?trial=osd',
      );

      await clusterCloudTabPage.clickCreateOSDTrialButton();
      await clusterCloudTabPage.isCreateOSDTrialPage();
      await clusterCloudTabPage.clickBackButton();
    });

    test('Check OSD section contents', async () => {
      await clusterCloudTabPage.checkManagedServiceLink(
        'Red Hat OpenShift Dedicated',
        'https://cloud.redhat.com/products/dedicated/',
      );

      await clusterCloudTabPage.checkManagedServiceButton(
        'Create cluster',
        '/openshift/create/osd',
      );

      await clusterCloudTabPage.clickCreateOSDButton();
      await clusterCloudTabPage.isCreateOSDPage();
      await clusterCloudTabPage.clickBackButton();

      await clusterCloudTabPage.expandToggle('#osd1');
      await clusterCloudTabPage.isTextVisible(OSDDescriptionText);

      await clusterCloudTabPage.checkManagedServiceLink(
        'Learn more about Red Hat OpenShift Dedicated',
        'https://cloud.redhat.com/products/dedicated/',
      );
    });

    test('Check Azure section contents', async () => {
      await clusterCloudTabPage.checkManagedServiceLink(
        'Azure Red Hat OpenShift',
        'https://azure.microsoft.com/en-us/services/openshift',
      );

      await clusterCloudTabPage.checkManagedServiceButton(
        'Try it on Azure',
        'https://azure.microsoft.com/en-us/services/openshift',
      );

      await clusterCloudTabPage.expandToggle('#azure2');
      await clusterCloudTabPage.isTextVisible(AzureDescriptionText);

      await clusterCloudTabPage.checkManagedServiceLink(
        'Learn more about Azure Red Hat OpenShift',
        'https://azure.microsoft.com/en-us/services/openshift',
      );
    });

    test('Check IBM Cloud section contents', async () => {
      await clusterCloudTabPage.checkManagedServiceLink(
        'Red Hat OpenShift on IBM Cloud',
        'https://www.ibm.com/cloud/openshift',
      );

      await clusterCloudTabPage.checkManagedServiceButton(
        'Try it on IBM',
        'https://cloud.ibm.com/kubernetes/catalog/create?platformType=openshift',
      );

      await clusterCloudTabPage.expandToggle('#ibm3');
      await clusterCloudTabPage.isTextVisible(IBMDescriptionText);

      await clusterCloudTabPage.checkManagedServiceLink(
        'Learn more about Red Hat OpenShift on IBM Cloud',
        'https://www.ibm.com/cloud/openshift',
      );
    });

    test('Check ROSA section contents', async () => {
      await clusterCloudTabPage.checkManagedServiceLink(
        'Red Hat OpenShift Service on AWS (ROSA)',
        'https://cloud.redhat.com/products/amazon-openshift',
      );

      await clusterCloudTabPage.clickCreateRosaButton();
      await clusterCloudTabPage.clickRosaClusterWithWeb();
      await clusterCloudTabPage.isCreateRosaPage();
      await clusterCloudTabPage.clickBackButton();

      await clusterCloudTabPage.expandToggle('#rosa4');
      await clusterCloudTabPage.isTextVisible(ROSADescriptionText);

      await clusterCloudTabPage.checkManagedServiceLink(
        'Learn more about Red Hat OpenShift Service on AWS',
        'https://cloud.redhat.com/products/amazon-openshift',
      );
    });

    test('Check "View your annual subscriptions quota" link', async () => {
      await clusterCloudTabPage.clickQuotaLink();
      await clusterCloudTabPage.isQuotaPage();
      await clusterCloudTabPage.clickBackButton();
    });

    test('Check all cloud provider links in "Run it yourself" table', async () => {
      await clusterCloudTabPage.checkRunItYourselfLink(
        'Alibaba Cloud',
        '/openshift/install/alibaba',
      );

      await clusterCloudTabPage.checkRunItYourselfLink('AWS (x86_64)', '/openshift/install/aws');

      await clusterCloudTabPage.checkRunItYourselfLink('AWS (ARM)', '/openshift/install/aws/arm');

      await clusterCloudTabPage.checkRunItYourselfLink(
        'AWS (multi-architecture)',
        '/openshift/install/aws/multi/installer-provisioned',
      );

      await clusterCloudTabPage.checkRunItYourselfLink(
        'Azure (x86_64)',
        '/openshift/install/azure',
      );

      await clusterCloudTabPage.checkRunItYourselfLink(
        'Azure (ARM)',
        '/openshift/install/azure/arm/installer-provisioned',
      );

      await clusterCloudTabPage.checkRunItYourselfLink(
        'Azure (multi-architecture)',
        '/openshift/install/azure/multi/installer-provisioned',
      );

      await clusterCloudTabPage.checkRunItYourselfLink('Google Cloud', '/openshift/install/gcp');

      await clusterCloudTabPage.checkRunItYourselfLink('IBM Cloud', '/openshift/install/ibm-cloud');

      await clusterCloudTabPage.checkRunItYourselfLink(
        'Baremetal (multi-architecture)',
        '/openshift/install/metal/multi',
      );

      await clusterCloudTabPage.checkRunItYourselfLink(
        'IBM PowerVS (ppc64le)',
        '/openshift/install/powervs/installer-provisioned',
      );

      await clusterCloudTabPage.checkRunItYourselfLink(
        'Platform agnostic (x86_64)',
        '/openshift/install/platform-agnostic',
      );

      await clusterCloudTabPage.checkRunItYourselfLink(
        'Oracle Cloud Infrastructure',
        '/openshift/install/oracle-cloud',
      );
    });
  },
);
