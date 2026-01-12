import OsdProductPage from '../../pageobjects/OsdProductPage.page';

const rows = [
  {
    label: 'Red Hat OpenShift Dedicated on Google Cloud Marketplace',
    badge: 'Documentation',
    linkUrl:
      'https://console.cloud.google.com/marketplace/product/redhat-marketplace/red-hat-openshift-dedicated',
  },
  {
    label: 'Red Hat OpenShift Dedicated Interactive Walkthrough',
    badge: 'Walkthrough',
    linkUrl:
      'https://www.redhat.com/en/products/interactive-walkthrough/install-openshift-dedicated-google-cloud',
  },
  {
    label: 'How to get started with OpenShift Dedicated on Google Cloud Marketplace',
    badge: 'Quickstart',
    linkUrl: 'https://www.youtube.com/watch?v=p9KBFvMDQJM&feature=youtu.be',
  },
];

describe(
  'OCP-79051 - OSD product page. Test is checking all main elements and text content on the page',
  { tags: ['smoke', 'osd', 'overview'] },
  () => {
    beforeEach(() => {
      cy.visit('/overview/osd');
      OsdProductPage.isOSDProductPage();
    });

    it('Validate Header Section', () => {
      OsdProductPage.isTitlePage();
      OsdProductPage.validateUrlLink(
        'Learn more about OpenShift Dedicated',
        'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated',
      );
    });

    it('Validate Create an OpenShift Dedicated cluster section cards', () => {
      OsdProductPage.createClusterCard().isCardTitle();
      OsdProductPage.createClusterCard().btnShouldExist('Create cluster', '/openshift/create/osd');
      OsdProductPage.clickCreateOSDButton();
      OsdProductPage.isCreateOSDPage();
      OsdProductPage.clickBackButton();

      OsdProductPage.learnMoreCard().isCardTitle();
      OsdProductPage.learnMoreCard()
        .checkLink(
          'Go to interactive walkthrough',
          'https://www.redhat.com/en/products/interactive-walkthrough/install-openshift-dedicated-google-cloud',
        )
        .opensInRightTab()
        .successfullyOpens();
    });

    it('Validate Benefits section - expand toggle buttons and check text contents', () => {
      OsdProductPage.isBenefitsTitle();
      OsdProductPage.expandFeature('Accelerate time to value');
      OsdProductPage.verifyFeatureContent(
        'Quickly build, deploy, and manage applications at scale with a comprehensive application platform.',
      );
      OsdProductPage.collapseFeature('Accelerate time to value');

      OsdProductPage.expandFeature('Focus on innovation');
      OsdProductPage.verifyFeatureContent(
        'Focus on innovationSimplify delivering, operating, and scaling workloads with automated deployment and proactive management of OpenShift clusters.',
      );
      OsdProductPage.collapseFeature('Focus on innovation');

      OsdProductPage.expandFeature('Gain hybrid cloud flexibility');
      OsdProductPage.verifyFeatureContent(
        'Get a consistent Red Hat OpenShift experience across the hybrid cloud for developers and operations teams.',
      );
      OsdProductPage.collapseFeature('Gain hybrid cloud flexibility');
    });

    it('Validate Features section - expand toggle buttons and check text contents', () => {
      OsdProductPage.isFeaturesTitle();
      OsdProductPage.expandFeature('Comprehensive application platform');
      OsdProductPage.verifyFeatureContent(
        'Fully integrated development and operational productivity features, such as Integrated Development Environment (IDE), monitoring and service mesh, runtimes, build pipelines, and more.',
      );
      OsdProductPage.collapseFeature('Comprehensive application platform');

      OsdProductPage.expandFeature('Expert support');
      OsdProductPage.verifyFeatureContent(
        'Engineered, operated, and supported by Red Hat site reliability engineering (SRE) with a 99.95% uptime service-level agreement (SLA) and 24x7 coverage.',
      );
      OsdProductPage.collapseFeature('Expert support');

      OsdProductPage.expandFeature('Streamlined billing and procurement');
      OsdProductPage.verifyFeatureContent(
        'Receive a single bill for both the Red Hat OpenShift service and Google Cloud infrastructure consumption.',
      );
      OsdProductPage.collapseFeature('Streamlined billing and procurement');

      OsdProductPage.expandFeature('High availability architecture');
      OsdProductPage.verifyFeatureContent(
        'Deploy clusters with multiple masters and infrastructure nodes across multiple availability zones in supported regions to ensure maximum availability and continuous operation.',
      );
      OsdProductPage.collapseFeature('High availability architecture');
    });

    it('Validate pricing section card by checking theirs text', () => {
      OsdProductPage.isPricingTitle();
      OsdProductPage.validatePricingCard({
        title: 'Hourly',
        yearlyText: 'Equivalent to ',
      });

      OsdProductPage.validatePricingCard({
        title: '1-Year',
        yearlyText: 'Equivalent to ',
      });

      OsdProductPage.validatePricingCard({
        title: '3-Year',
        yearlyText: 'Equivalent to ',
      });

      OsdProductPage.validateUrlLink(
        'Learn more about pricing (new window or tab',
        'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated?intcmp=7013a000003DQeVAAW#pricing',
      );
    });

    it('Validate recommendations section card by checking theirs text', () => {
      OsdProductPage.isRecommendationsTitle();
      OsdProductPage.validateRecommendationsCard({
        title: 'Infrastructure billing: Customer Cloud Subscription (CCS)',
        cardText: 'Flexibility in instance availability',
      });

      OsdProductPage.validateRecommendationsCard({
        title: 'Purchase channel: Google Cloud Marketplace',
        cardText: 'Flexible, PAYGO billing across all regions',
      });

      OsdProductPage.validateRecommendationsCard({
        title: 'Cloud provider: Google Cloud',
        cardText: 'Looking for an AWS option?',
      });
    });

    it('Validate Recommended content section', () => {
      OsdProductPage.isRecommendedContentTitle();
      OsdProductPage.validateRecommendedContentList('recommended-content', rows);
    });
  },
);
