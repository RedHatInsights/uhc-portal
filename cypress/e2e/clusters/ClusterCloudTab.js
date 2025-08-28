import GlobalNav from '../../pageobjects/GlobalNav.page';
import ClusterCloudTab from '../../pageobjects/ClusterCloudTab.page';

const OSDDescriptionText = 'A complete OpenShift cluster provided as a fully-managed cloud service';
const AzureDescriptionText =
  'A flexible, self-service deployment of OpenShift clusters provided as a fully-managed cloud service by Microsoft and Red Hat';
const IBMDescriptionText =
  'A preconfigured OpenShift environment provided as a fully-managed cloud service at enterprise scale';
const ROSADescriptionText =
  'Build, deploy, and manage Kubernetes applications with Red Hat OpenShift running natively on AWS';

describe(
  'Test checking elements at create cluster page, in Cloud tab selected - OCP-38888',
  { tags: ['smoke'] },
  () => {
    it('is Cloud tab selected', () => {
      cy.visit('/create/cloud');
      ClusterCloudTab.isCloudTabPage();
    });

    it('should display correct breadcrumbs', () => {
      GlobalNav.breadcrumbItem('Cluster List').should('exist');
      GlobalNav.breadcrumbItem('Cluster Type').should('exist');
    });

    it('Checks OSD Trial section contents', () => {
      cy.contains('h1', 'Select an OpenShift cluster type to create');

      ClusterCloudTab.managedServices()
        .checkLink(
          'Red Hat OpenShift Dedicated Trial',
          'https://cloud.redhat.com/products/dedicated/',
        )
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.managedServices().btnShouldExist(
        'Create trial cluster',
        '/openshift/create/osdtrial?trial=osd',
      );
      ClusterCloudTab.createOSDTrialButton().click();
      ClusterCloudTab.isCreateOSDTrialPage();
      ClusterCloudTab.clickBackButton();
    });

    it('Check OSD section contents', () => {
      ClusterCloudTab.managedServices()
        .checkLink('Red Hat OpenShift Dedicated', 'https://cloud.redhat.com/products/dedicated/')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.managedServices().btnShouldExist('Create cluster', '/openshift/create/osd');
      ClusterCloudTab.createOSDButton().click();
      ClusterCloudTab.isCreateOSDPage();
      ClusterCloudTab.clickBackButton();
      ClusterCloudTab.expandToggle('#osd1');
      ClusterCloudTab.isTextVisible(OSDDescriptionText);
      ClusterCloudTab.managedServices()
        .checkLink(
          'Learn more about Red Hat OpenShift Dedicated',
          'https://cloud.redhat.com/products/dedicated/',
        )
        .opensInRightTab()
        .successfullyOpens();
    });

    it('Check Azure section contents', () => {
      ClusterCloudTab.managedServices()
        .checkLink(
          'Azure Red Hat OpenShift',
          'https://azure.microsoft.com/en-us/services/openshift',
        )
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.managedServices().btnShouldExist(
        'Try it on Azure',
        'https://azure.microsoft.com/en-us/services/openshift',
      );
      ClusterCloudTab.expandToggle('#azure2');
      ClusterCloudTab.isTextVisible(AzureDescriptionText);
      ClusterCloudTab.managedServices()
        .checkLink(
          'Learn more about Azure Red Hat OpenShift',
          'https://azure.microsoft.com/en-us/services/openshift',
        )
        .opensInRightTab()
        .successfullyOpens();
    });

    it('Check IBM Cloud section contents', () => {
      ClusterCloudTab.managedServices()
        .checkLink('Red Hat OpenShift on IBM Cloud', 'https://www.ibm.com/cloud/openshift')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.managedServices().btnShouldExist(
        'Try it on IBM',
        'https://cloud.ibm.com/kubernetes/catalog/create?platformType=openshift',
      );
      ClusterCloudTab.expandToggle('#ibm3');
      ClusterCloudTab.isTextVisible(IBMDescriptionText);
      ClusterCloudTab.managedServices()
        .checkLink(
          'Learn more about Red Hat OpenShift on IBM Cloud',
          'https://www.ibm.com/cloud/openshift',
        )
        .opensInRightTab()
        .successfullyOpens();
    });

    it('Check ROSA section contents', () => {
      ClusterCloudTab.managedServices()
        .checkLink(
          'Red Hat OpenShift Service on AWS (ROSA)',
          'https://cloud.redhat.com/products/amazon-openshift',
        )
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.createRosaButton().click();
      ClusterCloudTab.rosaClusterWithWeb().should('be.visible').click();
      ClusterCloudTab.isCreateRosaPage();
      ClusterCloudTab.clickBackButton();
      ClusterCloudTab.expandToggle('#rosa4');
      ClusterCloudTab.isTextVisible(ROSADescriptionText);
      ClusterCloudTab.managedServices()
        .checkLink(
          'Learn more about Red Hat OpenShift Service on AWS',
          'https://cloud.redhat.com/products/amazon-openshift',
        )
        .opensInRightTab()
        .successfullyOpens();
    });

    it('Check "View your annual subscriptions quota" link', () => {
      cy.contains('a', 'View your annual subscriptions quota').click();
      ClusterCloudTab.isQuotaPage();
      ClusterCloudTab.clickBackButton();
    });

    it('Check all cloud provider links in "Run it yourself" table', () => {
      ClusterCloudTab.runItYourself()
        .checkLink('Alibaba Cloud', '/openshift/install/alibaba')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('AWS (x86_64)', '/openshift/install/aws')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('AWS (ARM)', '/openshift/install/aws/arm')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('AWS (multi-architecture)', '/openshift/install/aws/multi/installer-provisioned')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('Azure (x86_64)', '/openshift/install/azure')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('Azure (ARM)', '/openshift/install/azure/arm/installer-provisioned')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink(
          'Azure (multi-architecture)',
          '/openshift/install/azure/multi/installer-provisioned',
        )
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('Google Cloud', '/openshift/install/gcp')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('IBM Cloud', '/openshift/install/ibm-cloud')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('Baremetal (multi-architecture)', '/openshift/install/metal/multi')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('IBM PowerVS (ppc64le)', '/openshift/install/powervs/installer-provisioned')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('Platform agnostic (x86_64)', '/openshift/install/platform-agnostic')
        .opensInRightTab()
        .successfullyOpens();
      ClusterCloudTab.runItYourself()
        .checkLink('Oracle Cloud Infrastructure', '/openshift/install/oracle-cloud')
        .opensInRightTab()
        .successfullyOpens();
    });
  },
);
