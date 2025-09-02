import GlobalNav from '../../pageobjects/GlobalNav.page';
import Subscription from '../../pageobjects/Subscriptions.page';
import SubscriptionDedicatedAnnual from '../../fixtures/subscription/SubscriptionDedicated.json';
const annualDescriptionText =
  'The summary of all annual subscriptions for OpenShift Dedicated and select add-ons purchased by your organization or granted by Red Hat. For subscription information on OpenShift Container Platform or Red Hat OpenShift Service on AWS (ROSA), see OpenShift Usage';
const onDemandDecriptionText =
  'Active subscriptions allow your organization to use up to a certain number of OpenShift Dedicated clusters. Overall OSD subscription capacity and usage can be viewed in';

describe('Subscription page (OCP-25171)', { tags: ['smoke'] }, () => {
  it('Check the Subscription - from left navigations ', () => {
    Subscription.subscriptionLeftNavigationMenu().click();
    Subscription.annualSubscriptionLeftNavigationMenu().click();
    Subscription.isDedicatedAnnualPage();
    Subscription.isDedicatedSectionHeader();
  });

  it('Check the Subscription - Annual Subscriptions (Managed) page headers ', () => {
    cy.visit('/quota');
    // Setting the customized quota response from fixture definitions.
    Subscription.patchCustomQuotaDefinition(SubscriptionDedicatedAnnual);
    Subscription.isDedicatedAnnualPage();
    Subscription.isDedicatedSectionHeader();
    cy.contains(annualDescriptionText).within(() => {
      Subscription.isContainEmbeddedLink(
        'OpenShift Usage',
        '/openshift/subscriptions/usage/openshift',
      );
    });
    Subscription.isSubscriptionTableHeader();
  });
  it('Check the Subscription - Annual Subscriptions (Managed) page details ', () => {
    Subscription.checkQuotaTableColumns('Resource type');
    Subscription.checkQuotaTableColumns('Resource name');
    Subscription.checkQuotaTableColumns('Availability');
    Subscription.checkQuotaTableColumns('Plan type');
    Subscription.checkQuotaTableColumns('Cluster type');
    Subscription.checkQuotaTableColumns('Used');
    Subscription.checkQuotaTableColumns('Capacity');
    Subscription.planTypeHelpButton().click();
    cy.contains('Standard: Cluster infrastructure costs paid by Red Hat').should('be.visible');
    cy.contains('CCS: Cluster infrastructure costs paid by the customer').should('be.visible');
    Subscription.planTypeHelpButton().click();

    let cells = Subscription.getQuotaTableRow(SubscriptionDedicatedAnnual.items[0]);
    cells.next().contains(SubscriptionDedicatedAnnual.items[0].related_resources[0].resource_name);
    cells.next().contains('N/A');
    cells.next().contains('Standard');
    cells.next().contains('OSD');
    cells.next().contains('10 of 10');

    cells = Subscription.getQuotaTableRow(SubscriptionDedicatedAnnual.items[1]);
    cells.next().contains(SubscriptionDedicatedAnnual.items[1].related_resources[0].resource_name);
    cells.next().contains('N/A');
    cells.next().contains('CCS');
    cells.next().contains('OSD');
    cells.next().contains('50 of 100');

    cells = Subscription.getQuotaTableRow(SubscriptionDedicatedAnnual.items[2]);
    cells.next().contains(SubscriptionDedicatedAnnual.items[2].related_resources[0].resource_name);
    cells.next().contains('N/A');
    cells.next().contains('Standard');
    cells.next().contains('OSD');
    cells.next().contains('0 of 280');
  });

  it('Check the Subscription - Dedicated Ondemand page headers ', () => {
    cy.visit('quota/resource-limits');
    // Setting the customized quota response from fixture definitions.
    Subscription.patchCustomQuotaDefinition(SubscriptionDedicatedAnnual);
    Subscription.isDedicatedOnDemandPage();
    Subscription.isDedicatedOnDemandSectionHeader();
    cy.contains(onDemandDecriptionText).within(() => {
      Subscription.isContainEmbeddedLink(
        'Dedicated (On-Demand)',
        '/openshift/subscriptions/openshift-dedicated',
      );
    });
    Subscription.isSubscriptionTableHeader();
  });
  it('Check the Subscription - Dedicated Ondemand page details ', () => {
    Subscription.checkQuotaTableColumns('Resource type');
    Subscription.checkQuotaTableColumns('Resource name');
    Subscription.checkQuotaTableColumns('Availability');
    Subscription.checkQuotaTableColumns('Plan type');
    Subscription.checkQuotaTableColumns('Cluster type');
    Subscription.checkQuotaTableColumns('Used');
    Subscription.checkQuotaTableColumns('Capacity');
    Subscription.planTypeHelpButton().click();
    cy.contains('Standard: Cluster infrastructure costs paid by Red Hat').should('be.visible');
    cy.contains('CCS: Cluster infrastructure costs paid by the customer').should('be.visible');
    Subscription.planTypeHelpButton().click();

    let cells = Subscription.getQuotaTableRow(SubscriptionDedicatedAnnual.items[3]);
    cells.next().contains(SubscriptionDedicatedAnnual.items[3].related_resources[0].resource_name);
    cells.next().contains('N/A');
    cells.next().contains('CCS');
    cells.next().contains('ROSA');
    cells.next().contains('1 of 2020');

    cells = Subscription.getQuotaTableRow(SubscriptionDedicatedAnnual.items[4]);
    cells.next().contains('vCPU');
    cells.next().contains('N/A');
    cells.next().contains('CCS');
    cells.next().contains('ROSA');
    cells.next().contains('48 of 204000');
  });
  it('Check the Subscription - Annual Subscriptions (Managed) page when no quota available ', () => {
    cy.visit('/quota');
    // Setting the empty quota response to check the empty conditions
    Subscription.patchCustomQuotaDefinition();
    Subscription.isDedicatedAnnualPage();
    cy.contains('You do not have any quota').should('be.visible');
  });
  it('Check the Subscription - Dedicated Ondemand page when no quota available ', () => {
    cy.visit('quota/resource-limits');
    // Setting the empty quota response to check the empty conditions
    Subscription.patchCustomQuotaDefinition();
    Subscription.isDedicatedOnDemandPage();
    cy.contains('Marketplace On-Demand subscriptions not detected').should('be.visible');
    Subscription.enableMarketplaceLink()
      .closest('a')
      .should('have.attr', 'href')
      .and('include', 'https://marketplace.redhat.com/en-us/products/red-hat-openshift-dedicated');
    Subscription.learnMoreLink()
      .closest('a')
      .should('have.attr', 'href')
      .and(
        'include',
        'https://access.redhat.com/documentation/en-us/openshift_cluster_manager/2023/html/managing_clusters/assembly-cluster-subscriptions',
      );
  });
});
