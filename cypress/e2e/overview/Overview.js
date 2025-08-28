import Overview from '../../pageobjects/Overview.page';
import currentOcVersion from '../../support/CurrentOcVersion';

describe('OCM Overview Page tests (OCP-65189)', { tags: ['smoke'] }, () => {
  before(() => {
    currentOcVersion.retrieveVersion();
    cy.visit('/overview');
    Overview.isOverviewPage();
  });

  it('OCM Overview Page - header and central section', () => {
    Overview.header()
      .checkTitle('Get started with OpenShift')
      .checkLink('Learn more', 'https://www.redhat.com/en/technologies/cloud-computing/openshift')
      .opensInRightTab()
      .successfullyOpens();

    Overview.centralSectionCardsExpected(7);

    const runOn = 'Runs on',
      purchaseThrough = 'Purchase through',
      billingType = 'Billing type';
    var card = Overview.centralSectionCard('offering-card_RHOSD');
    card.cyObj.contains('Red Hat OpenShift Dedicated');
    card
      .btnShouldExist('Create cluster', '/openshift/create/osd')
      .opensExpectedPage('Create an OpenShift Dedicated Cluster');
    card.shouldHaveLabel('Managed service');
    card.cardDetails({
      [runOn]: 'Google Cloud',
      [purchaseThrough]: 'Red Hat',
      [billingType]: 'Flexible or fixed',
    });
    card.checkLink('View details', '/openshift/overview/osd').opensInRightTab();

    card = Overview.centralSectionCard('offering-card_AWS');
    card.cyObj.contains('Red Hat OpenShift Service on AWS (ROSA)');
    card
      .btnShouldExist('Create cluster', '/openshift/create/rosa/getstarted')
      .opensExpectedPage('Set up Red Hat OpenShift Service on AWS (ROSA)');
    card.shouldHaveLabel('Managed service');
    card.cardDetails({
      [runOn]: 'Amazon Web Services',
      [purchaseThrough]: 'Amazon Web Services',
      [billingType]: 'Flexible hourly',
    });
    card.checkLink('View details', '/openshift/overview/rosa').opensInRightTab();

    card = Overview.centralSectionCard('offering-card_Azure');
    card.cyObj.contains('Azure Red Hat OpenShift (ARO)');
    card.shouldHaveLabel('Managed service');
    card.cardDetails({
      [runOn]: 'Microsoft Azure',
      [purchaseThrough]: 'Microsoft',
      [billingType]: 'Flexible hourly',
    });
    card
      .checkLink('Learn more on Azure', 'https://azure.microsoft.com/en-us/products/openshift/')
      .opensInRightTab()
      .successfullyOpens();

    card = Overview.centralSectionCard('offering-card_RHOCP');
    card.cyObj.contains('Red Hat OpenShift Container Platform');
    card
      .btnShouldExist('Create cluster', '/openshift/create')
      .opensExpectedPage('Select an OpenShift cluster type to create');
    card.shouldHaveLabel('Self-managed service');
    card.cardDetails({
      [runOn]: 'Supported infrastructures',
      [purchaseThrough]: 'Red Hat',
      [billingType]: 'Annual subscription',
    });
    card.checkLink('Register cluster', '/openshift/register').opensInRightTab();

    card = Overview.centralSectionCard('offering-card_RHOIBM');
    card.cyObj.contains('Red Hat OpenShift on IBM Cloud');
    card.shouldHaveLabel('Managed service');
    card.cardDetails({
      [runOn]: 'IBM Cloud',
      [purchaseThrough]: 'IBM',
      [billingType]: 'Flexible hourly',
    });
    card
      .checkLink(
        'Learn more on IBM',
        'https://cloud.ibm.com/kubernetes/catalog/create?platformType=openshift',
      )
      .opensInRightTab();

    card = Overview.centralSectionCard('offering-card_DEVSNBX');
    card.cyObj.contains('Developer Sandbox');
    card.shouldHaveLabel('Managed service');
    card.checkLink('View details', '/openshift/sandbox').opensInRightTab();

    card = Overview.centralSectionCard('offering-card_MIGRATION');
    card.cyObj.contains('Evaluate VMware to Openshift Migration');
    card.shouldHaveLabel('Self-managed service');
    card.checkLink('Start evaluation', '/openshift/migration-assessment').opensInRightTab();

    Overview.centralSectionFooterLinkExists(
      'View all OpenShift cluster types',
      '/openshift/create',
    ).opensExpectedPage('Select an OpenShift cluster type to create');
  });

  it('OCM Overview Page - Featured products section', () => {
    Overview.featuredProductsExpected(4);

    var recommendedOperator = Overview.productsOrOperatorCards(
      'Advanced Cluster Security for Kubernetes',
      'Protect your containerized Kubernetes workloads in all major clouds and hybrid platforms',
    );
    recommendedOperator.click();
    Overview.drawerContentTitle().should('have.text', 'Advanced Cluster Security for Kubernetes');
    Overview.drawerCloseButton();

    recommendedOperator = Overview.productsOrOperatorCards(
      'Red Hat OpenShift AI',
      'Create and deliver generative and predictive AI models at scale across on-premise and public cloud environments',
    );
    recommendedOperator.click();
    Overview.drawerContentTitle().should('have.text', 'Red Hat OpenShift AI');
    Overview.drawerCloseButton();

    recommendedOperator = Overview.productsOrOperatorCards(
      'OpenShift Virtualization',
      'Streamline your operations and reduce complexity when you run and manage your VMs, containers, and serverless workloads in a single platform',
    );
    recommendedOperator.click();
    Overview.drawerContentTitle().should('have.text', 'OpenShift Virtualization');
    Overview.drawerCloseButton();

    recommendedOperator = Overview.productsOrOperatorCards(
      'Red Hat Advanced Cluster Management for Kubernetes',
      'Manage any Kubernetes cluster in your fleet',
    );
    recommendedOperator.click();
    Overview.drawerContentTitle().should(
      'have.text',
      'Red Hat Advanced Cluster Management for Kubernetes',
    );
    Overview.drawerCloseButton();
  });

  it('OCM Overview Page - Recommended Operators section', () => {
    Overview.isRecommendedOperatorsHeaderVisible(
      'https://catalog.redhat.com/search?searchType=software&deployed_as=Operator',
    );

    Overview.recommendedOperatorsExpected(3);

    var recommendedOperator = Overview.productsOrOperatorCards(
      'Red Hat OpenShift GitOps',
      'Integrate git repositories, continuous integration/continuous delivery (CI/CD) tools, and Kubernetes',
    );
    recommendedOperator.click();
    Overview.drawerContentTitle().should('have.text', 'Red Hat OpenShift GitOps');
    Overview.drawerCloseButton();

    recommendedOperator = Overview.productsOrOperatorCards(
      'Red Hat OpenShift Pipelines',
      'Automate your application delivery using a continuous integration and continuous deployment (CI/CD) framework',
    );
    recommendedOperator.click();
    Overview.drawerContentTitle().should('have.text', 'Red Hat OpenShift Pipelines');
    Overview.drawerCloseButton();

    recommendedOperator = Overview.productsOrOperatorCards(
      'Red Hat OpenShift Service Mesh',
      'Connect, manage, and observe microservices-based applications in a uniform way',
    );
    recommendedOperator.click();
    Overview.drawerContentTitle().should('have.text', 'Red Hat OpenShift Service Mesh');
    Overview.drawerCloseButton();
  });
});
