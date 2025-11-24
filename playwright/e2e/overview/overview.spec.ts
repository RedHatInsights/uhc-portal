import { test, expect } from '../../fixtures/pages';

test.describe.serial('OCM Overview Page tests (OCP-65189)', { tag: ['@smoke', '@ci'] }, () => {
  test.beforeAll(async ({ navigateTo }) => {
    // Navigate to overview page and wait for it to load
    await navigateTo('overview');
  });
  test('OCM Overview Page - header and central section', async ({ overviewPage }) => {
    // Verify we're on the overview page
    await overviewPage.isOverviewPage();

    // Check Learn more link
    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.headerLearnMoreLink(),
      'https://www.redhat.com/en/technologies/cloud-computing/openshift',
    );

    // Verify central section has expected number of cards
    await overviewPage.centralSectionCardsExpected(7);

    // Red Hat OpenShift Dedicated card
    await overviewPage.expectCardHasText('offering-card_RHOSD', 'Red Hat OpenShift Dedicated');
    await overviewPage.expectCardHasLabel('offering-card_RHOSD', 'Managed service');

    // Check Create cluster button redirects properly
    await expect(overviewPage.cardCreateClusterButton('offering-card_RHOSD')).toHaveAttribute(
      'href',
      '/openshift/create/osd',
    );

    // Check card details
    await overviewPage.expectCardDetails('offering-card_RHOSD', {
      'Runs on': 'Google Cloud',
      'Purchase through': 'Red Hat',
      'Billing type': 'Flexible or fixed',
    });

    // Check View details link
    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.cardViewDetailsLink('offering-card_RHOSD'),
      '/openshift/overview/osd',
    );

    // Red Hat OpenShift Service on AWS (ROSA) card
    await overviewPage.expectCardHasText(
      'offering-card_AWS',
      'Red Hat OpenShift Service on AWS (ROSA)',
    );
    await overviewPage.expectCardHasLabel('offering-card_AWS', 'Managed service');

    await expect(overviewPage.cardCreateClusterButton('offering-card_AWS')).toHaveAttribute(
      'href',
      '/openshift/create/rosa/getstarted',
    );

    await overviewPage.expectCardDetails('offering-card_AWS', {
      'Runs on': 'Amazon Web Services',
      'Purchase through': 'Amazon Web Services',
      'Billing type': 'Flexible hourly',
    });

    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.cardViewDetailsLink('offering-card_AWS'),
      '/openshift/overview/rosa',
    );

    // Azure Red Hat OpenShift (ARO) card
    await overviewPage.expectCardHasText('offering-card_Azure', 'Azure Red Hat OpenShift (ARO)');
    await overviewPage.expectCardHasLabel('offering-card_Azure', 'Managed service');

    await overviewPage.expectCardDetails('offering-card_Azure', {
      'Runs on': 'Microsoft Azure',
      'Purchase through': 'Microsoft',
      'Billing type': 'Flexible hourly',
    });

    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.cardLearnMoreLink('offering-card_Azure', 'Learn more on Azure'),
      'https://azure.microsoft.com/en-us/products/openshift/',
    );

    // Red Hat OpenShift Container Platform card
    await overviewPage.expectCardHasText(
      'offering-card_RHOCP',
      'Red Hat OpenShift Container Platform',
    );
    await overviewPage.expectCardHasLabel('offering-card_RHOCP', 'Self-managed service');

    await expect(overviewPage.cardCreateClusterButton('offering-card_RHOCP')).toHaveAttribute(
      'href',
      '/openshift/create',
    );

    await overviewPage.expectCardDetails('offering-card_RHOCP', {
      'Runs on': 'Supported infrastructures',
      'Purchase through': 'Red Hat',
      'Billing type': 'Annual subscription',
    });

    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.cardRegisterClusterLink('offering-card_RHOCP'),
      '/openshift/register',
    );

    // Red Hat OpenShift on IBM Cloud card
    await overviewPage.expectCardHasText('offering-card_RHOIBM', 'Red Hat OpenShift on IBM Cloud');
    await overviewPage.expectCardHasLabel('offering-card_RHOIBM', 'Managed service');

    await overviewPage.expectCardDetails('offering-card_RHOIBM', {
      'Runs on': 'IBM Cloud',
      'Purchase through': 'IBM',
      'Billing type': 'Flexible hourly',
    });

    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.cardLearnMoreLink('offering-card_RHOIBM', 'Learn more on IBM'),
      'https://cloud.ibm.com/kubernetes/catalog/create?platformType=openshift',
    );

    // Developer Sandbox card
    await overviewPage.expectCardHasText('offering-card_DEVSNBX', 'Developer Sandbox');
    await overviewPage.expectCardHasLabel('offering-card_DEVSNBX', 'Managed service');

    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.cardViewDetailsLink('offering-card_DEVSNBX'),
      'https://sandbox.redhat.com',
    );

    // Migration card
    await overviewPage.expectCardHasText(
      'offering-card_MIGRATION',
      'Evaluate VMware to Openshift Migration',
    );
    await overviewPage.expectCardHasLabel('offering-card_MIGRATION', 'Self-managed service');

    await overviewPage.expectLinkOpensInNewTab(
      overviewPage.cardLearnMoreLink('offering-card_MIGRATION', 'Start evaluation'),
      '/openshift/migration-assessment',
    );

    // Check footer link
    await overviewPage.centralSectionFooterLinkExists(
      'View all OpenShift cluster types',
      '/openshift/create',
    );
  });

  test('OCM Overview Page - Featured products section', async ({ overviewPage }) => {
    // Verify expected number of featured products
    await overviewPage.featuredProductsExpected(4);

    // Advanced Cluster Security for Kubernetes
    const learnMoreButton1 = overviewPage.productsOrOperatorCards(
      'Advanced Cluster Security for Kubernetes',
      'Protect your containerized Kubernetes workloads in all major clouds and hybrid platforms',
    );
    await learnMoreButton1.click();
    await overviewPage.expectDrawerTitle('Advanced Cluster Security for Kubernetes');
    await overviewPage.closeDrawer();

    // Red Hat OpenShift AI
    const learnMoreButton2 = overviewPage.productsOrOperatorCards(
      'Red Hat OpenShift AI',
      'Create and deliver generative and predictive AI models at scale across on-premise and public cloud environments',
    );
    await learnMoreButton2.click();
    await overviewPage.expectDrawerTitle('Red Hat OpenShift AI');
    await overviewPage.closeDrawer();

    // OpenShift Virtualization
    const learnMoreButton3 = overviewPage.productsOrOperatorCards(
      'OpenShift Virtualization',
      'Streamline your operations and reduce complexity when you run and manage your VMs, containers, and serverless workloads in a single platform',
    );
    await learnMoreButton3.click();
    await overviewPage.expectDrawerTitle('OpenShift Virtualization');
    await overviewPage.closeDrawer();

    // Red Hat Advanced Cluster Management for Kubernetes
    const learnMoreButton4 = overviewPage.productsOrOperatorCards(
      'Red Hat Advanced Cluster Management for Kubernetes',
      'Manage any Kubernetes cluster in your fleet',
    );
    await learnMoreButton4.click();
    await overviewPage.expectDrawerTitle('Red Hat Advanced Cluster Management for Kubernetes');
    await overviewPage.closeDrawer();
  });

  test('OCM Overview Page - Recommended Operators section', async ({ overviewPage }) => {
    // Check header link
    await overviewPage.isRecommendedOperatorsHeaderVisible(
      'https://catalog.redhat.com/search?searchType=software&deployed_as=Operator',
    );

    // Verify expected number of recommended operators
    await overviewPage.recommendedOperatorsExpected(3);

    // Red Hat OpenShift GitOps
    const gitOpsLearnMore = overviewPage.productsOrOperatorCards(
      'Red Hat OpenShift GitOps',
      'Integrate git repositories, continuous integration/continuous delivery (CI/CD) tools, and Kubernetes',
    );
    await gitOpsLearnMore.click();
    await overviewPage.expectDrawerTitle('Red Hat OpenShift GitOps');
    await overviewPage.closeDrawer();

    // Red Hat OpenShift Pipelines
    const pipelinesLearnMore = overviewPage.productsOrOperatorCards(
      'Red Hat OpenShift Pipelines',
      'Automate your application delivery using a continuous integration and continuous deployment (CI/CD) framework',
    );
    await pipelinesLearnMore.click();
    await overviewPage.expectDrawerTitle('Red Hat OpenShift Pipelines');
    await overviewPage.closeDrawer();

    // Red Hat OpenShift Service Mesh
    const serviceMeshLearnMore = overviewPage.productsOrOperatorCards(
      'Red Hat OpenShift Service Mesh',
      'Connect, manage, and observe microservices-based applications in a uniform way',
    );
    await serviceMeshLearnMore.click();
    await overviewPage.expectDrawerTitle('Red Hat OpenShift Service Mesh');
    await overviewPage.closeDrawer();
  });
});
