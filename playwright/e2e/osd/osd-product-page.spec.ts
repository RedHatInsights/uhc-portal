import { test } from '../../fixtures/pages';

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

test.describe.serial(
  'OCP-79051 - OSD product page. Test is checking all main elements and text content on the page',
  { tag: ['@smoke', '@osd'] },
  () => {
    test.beforeAll(async ({ navigateTo, osdProductPage }) => {
      await navigateTo('overview/osd');
      await osdProductPage.isOSDProductPage();
    });

    test('Validate Header Section', async ({ osdProductPage }) => {
      await osdProductPage.isTitlePage();
      await osdProductPage.validateUrlLink(
        'Learn more about OpenShift Dedicated',
        'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated',
      );
    });

    test('Validate Create an OpenShift Dedicated cluster section cards', async ({
      osdProductPage,
    }) => {
      await osdProductPage.createClusterCardIsCardTitle();
      await osdProductPage.createClusterCardBtnShouldExist(
        'Create cluster',
        '/openshift/create/osd',
      );
      await osdProductPage.clickCreateOSDButton();
      await osdProductPage.isCreateOSDPage();
      await osdProductPage.clickBackButton();

      await osdProductPage.learnMoreCardIsCardTitle();
      await osdProductPage.learnMoreCardCheckLink(
        'Go to interactive walkthrough',
        'https://www.redhat.com/en/products/interactive-walkthrough/install-openshift-dedicated-google-cloud',
      );
    });

    test('Validate Benefits section - expand toggle buttons and check text contents', async ({
      osdProductPage,
    }) => {
      await osdProductPage.isBenefitsTitle();

      await osdProductPage.expandFeature('Accelerate time to value');
      await osdProductPage.verifyFeatureContent(
        'Quickly build, deploy, and manage applications at scale with a comprehensive application platform.',
      );
      await osdProductPage.collapseFeature('Accelerate time to value');

      await osdProductPage.expandFeature('Focus on innovation');
      await osdProductPage.verifyFeatureContent(
        'Focus on innovationSimplify delivering, operating, and scaling workloads with automated deployment and proactive management of OpenShift clusters.',
      );
      await osdProductPage.collapseFeature('Focus on innovation');

      await osdProductPage.expandFeature('Gain hybrid cloud flexibility');
      await osdProductPage.verifyFeatureContent(
        'Get a consistent Red Hat OpenShift experience across the hybrid cloud for developers and operations teams.',
      );
      await osdProductPage.collapseFeature('Gain hybrid cloud flexibility');
    });

    test('Validate Features section - expand toggle buttons and check text contents', async ({
      osdProductPage,
    }) => {
      await osdProductPage.isFeaturesTitle();

      await osdProductPage.expandFeature('Comprehensive application platform');
      await osdProductPage.verifyFeatureContent(
        'Fully integrated development and operational productivity features, such as Integrated Development Environment (IDE), monitoring and service mesh, runtimes, build pipelines, and more.',
      );
      await osdProductPage.collapseFeature('Comprehensive application platform');

      await osdProductPage.expandFeature('Expert support');
      await osdProductPage.verifyFeatureContent(
        'Engineered, operated, and supported by Red Hat site reliability engineering (SRE) with a 99.95% uptime service-level agreement (SLA) and 24x7 coverage.',
      );
      await osdProductPage.collapseFeature('Expert support');

      await osdProductPage.expandFeature('Streamlined billing and procurement');
      await osdProductPage.verifyFeatureContent(
        'Receive a single bill for both the Red Hat OpenShift service and Google Cloud infrastructure consumption.',
      );
      await osdProductPage.collapseFeature('Streamlined billing and procurement');

      await osdProductPage.expandFeature('High availability architecture');
      await osdProductPage.verifyFeatureContent(
        'Deploy clusters with multiple masters and infrastructure nodes across multiple availability zones in supported regions to ensure maximum availability and continuous operation.',
      );
      await osdProductPage.collapseFeature('High availability architecture');
    });

    test('Validate pricing section card by checking theirs text', async ({ osdProductPage }) => {
      await osdProductPage.isPricingTitle();

      await osdProductPage.validatePricingCard({
        title: 'Hourly',
        yearlyText: 'Equivalent to ',
      });

      await osdProductPage.validatePricingCard({
        title: '1-Year',
        yearlyText: 'Equivalent to ',
      });

      await osdProductPage.validatePricingCard({
        title: '3-Year',
        yearlyText: 'Equivalent to ',
      });

      await osdProductPage.validateUrlLink(
        'Learn more about pricing (new window or tab',
        'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated?intcmp=7013a000003DQeVAAW#pricing',
      );
    });

    test('Validate recommendations section card by checking theirs text', async ({
      osdProductPage,
    }) => {
      await osdProductPage.isRecommendationsTitle();

      await osdProductPage.validateRecommendationsCard({
        title: 'Infrastructure billing: Customer Cloud Subscription (CCS)',
        cardText: 'Flexibility in instance availability',
      });

      await osdProductPage.validateRecommendationsCard({
        title: 'Purchase channel: Google Cloud Marketplace',
        cardText: 'Flexible, PAYGO billing across all regions',
      });

      await osdProductPage.validateRecommendationsCard({
        title: 'Cloud provider: Google Cloud',
        cardText: 'Looking for an AWS option?',
      });
    });

    test('Validate Recommended content section', async ({ osdProductPage }) => {
      await osdProductPage.isRecommendedContentTitle();
      await osdProductPage.validateRecommendedContentList('recommended-content', rows);
    });
  },
);
