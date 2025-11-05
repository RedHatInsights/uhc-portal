import { test } from '../../fixtures/pages';

// Description text constants
const OSDDescriptionText = 'A complete OpenShift cluster provided as a fully-managed cloud service';
const AzureDescriptionText =
  'A flexible, self-service deployment of OpenShift clusters provided as a fully-managed cloud service by Microsoft and Red Hat';
const IBMDescriptionText =
  'A preconfigured OpenShift environment provided as a fully-managed cloud service at enterprise scale';
const ROSADescriptionText =
  'Build, deploy, and manage Kubernetes applications with Red Hat OpenShift running natively on AWS';

test.describe.serial(
  'Test checking elements at create cluster page, in Cloud tab selected - OCP-38888',
  { tag: ['@smoke', '@ci'] },
  () => {
    test.beforeAll(async ({ navigateTo }) => {
      // Navigate to cloud create page
      await navigateTo('create/cloud');
    });
    test('is Cloud tab selected', async ({ createClusterPage }) => {
      await createClusterPage.isCloudTabPage();
    });

    test('should display correct breadcrumbs', async ({ createClusterPage }) => {
      await createClusterPage.checkBreadcrumbs();
    });

    test('Checks OSD Trial section contents', async ({ createClusterPage }) => {
      await createClusterPage.isCreateClusterPageHeaderVisible();

      await createClusterPage.checkManagedServiceLink(
        'Red Hat OpenShift Dedicated Trial',
        'https://cloud.redhat.com/products/dedicated/',
      );

      await createClusterPage.checkManagedServiceButton(
        'Create trial cluster',
        '/openshift/create/osdtrial?trial=osd',
      );

      await createClusterPage.clickCreateOSDTrialButton();
      await createClusterPage.isCreateOSDTrialPage();
      await createClusterPage.clickBackButton();
    });

    test('Check OSD section contents', async ({ createClusterPage }) => {
      await createClusterPage.checkManagedServiceLink(
        'Red Hat OpenShift Dedicated',
        'https://cloud.redhat.com/products/dedicated/',
      );

      await createClusterPage.checkManagedServiceButton('Create cluster', '/openshift/create/osd');

      await createClusterPage.clickCreateOSDButton();
      await createClusterPage.isCreateOSDPage();
      await createClusterPage.clickBackButton();

      await createClusterPage.expandToggle('#osd1');
      await createClusterPage.isTextVisible(OSDDescriptionText);

      await createClusterPage.checkManagedServiceLink(
        'Learn more about Red Hat OpenShift Dedicated',
        'https://cloud.redhat.com/products/dedicated/',
      );
    });

    test('Check Azure section contents', async ({ createClusterPage }) => {
      await createClusterPage.checkManagedServiceLink(
        'Azure Red Hat OpenShift',
        'https://azure.microsoft.com/en-us/services/openshift',
      );

      await createClusterPage.checkManagedServiceButton(
        'Try it on Azure',
        'https://azure.microsoft.com/en-us/services/openshift',
      );

      await createClusterPage.expandToggle('#azure2');
      await createClusterPage.isTextVisible(AzureDescriptionText);

      await createClusterPage.checkManagedServiceLink(
        'Learn more about Azure Red Hat OpenShift',
        'https://azure.microsoft.com/en-us/services/openshift',
      );
    });

    test('Check IBM Cloud section contents', async ({ createClusterPage }) => {
      await createClusterPage.checkManagedServiceLink(
        'Red Hat OpenShift on IBM Cloud',
        'https://www.ibm.com/cloud/openshift',
      );

      await createClusterPage.checkManagedServiceButton(
        'Try it on IBM',
        'https://cloud.ibm.com/kubernetes/catalog/create?platformType=openshift',
      );

      await createClusterPage.expandToggle('#ibm3');
      await createClusterPage.isTextVisible(IBMDescriptionText);

      await createClusterPage.checkManagedServiceLink(
        'Learn more about Red Hat OpenShift on IBM Cloud',
        'https://www.ibm.com/cloud/openshift',
      );
    });

    test('Check ROSA section contents', async ({ createClusterPage }) => {
      await createClusterPage.checkManagedServiceLink(
        'Red Hat OpenShift Service on AWS (ROSA)',
        'https://cloud.redhat.com/products/amazon-openshift',
      );

      await createClusterPage.clickCreateRosaButton();
      await createClusterPage.clickRosaClusterWithWeb();
      await createClusterPage.isCreateRosaPage();
      await createClusterPage.clickBackButton();

      await createClusterPage.expandToggle('#rosa4');
      await createClusterPage.isTextVisible(ROSADescriptionText);

      await createClusterPage.checkManagedServiceLink(
        'Learn more about Red Hat OpenShift Service on AWS',
        'https://cloud.redhat.com/products/amazon-openshift',
      );
    });

    test('Check "View your annual subscriptions quota" link', async ({ createClusterPage }) => {
      await createClusterPage.clickQuotaLink();
      await createClusterPage.isQuotaPage();
      await createClusterPage.clickBackButton();
    });

    test('Check all cloud provider links in "Run it yourself" table', async ({
      createClusterPage,
    }) => {
      await createClusterPage.checkRunItYourselfLink('Alibaba Cloud', '/openshift/install/alibaba');

      await createClusterPage.checkRunItYourselfLink('AWS (x86_64)', '/openshift/install/aws');

      await createClusterPage.checkRunItYourselfLink('AWS (ARM)', '/openshift/install/aws/arm');

      await createClusterPage.checkRunItYourselfLink(
        'AWS (multi-architecture)',
        '/openshift/install/aws/multi/installer-provisioned',
      );

      await createClusterPage.checkRunItYourselfLink('Azure (x86_64)', '/openshift/install/azure');

      await createClusterPage.checkRunItYourselfLink(
        'Azure (ARM)',
        '/openshift/install/azure/arm/installer-provisioned',
      );

      await createClusterPage.checkRunItYourselfLink(
        'Azure (multi-architecture)',
        '/openshift/install/azure/multi/installer-provisioned',
      );

      await createClusterPage.checkRunItYourselfLink('Google Cloud', '/openshift/install/gcp');

      await createClusterPage.checkRunItYourselfLink('IBM Cloud', '/openshift/install/ibm-cloud');

      await createClusterPage.checkRunItYourselfLink(
        'Baremetal (multi-architecture)',
        '/openshift/install/metal/multi',
      );

      await createClusterPage.checkRunItYourselfLink(
        'IBM PowerVS (ppc64le)',
        '/openshift/install/powervs/installer-provisioned',
      );

      await createClusterPage.checkRunItYourselfLink(
        'Platform agnostic (x86_64)',
        '/openshift/install/platform-agnostic',
      );

      await createClusterPage.checkRunItYourselfLink(
        'Oracle Cloud Infrastructure',
        '/openshift/install/oracle-cloud',
      );
    });
  },
);
