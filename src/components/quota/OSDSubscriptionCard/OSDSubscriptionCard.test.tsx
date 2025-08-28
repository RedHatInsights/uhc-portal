import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import * as Fixtures from '../__tests__/Quota.fixtures';

import OSDSubscriptionCard from './OSDSubscriptionCard';

const props = {
  marketplace: undefined,
};

const marketplaceTexts = {
  subscriptionLink: 'Dedicated (On-Demand)',
  subscriptionSubtitle: 'OpenShift Dedicated',
  subscriptionsDescription:
    'Active subscriptions allow your organization to use up to a certain number of OpenShift Dedicated clusters. Overall OSD subscription capacity and usage can be viewed in',
};

const nonMarketplaceTexts = {
  subscriptionLink: 'OpenShift Usage',
  subscriptionSubtitle: 'Annual Subscriptions',
  subscriptionsDescription:
    'The summary of all annual subscriptions for OpenShift Dedicated and select add-ons purchased by your organization or granted by Red Hat. For subscription information on OpenShift Container Platform or Red Hat OpenShift Service on AWS (ROSA), see',
};

describe('OSDSubscriptionCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('is accessible', async () => {
    const newProps = { ...props, marketplace: true };
    const { container } = render(<OSDSubscriptionCard {...Fixtures} {...newProps} />);
    expect(await screen.findByText('OpenShift Dedicated')).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('calls fetch method', () => {
    expect(Fixtures.fetchQuotaCost).not.toHaveBeenCalled();
    render(<OSDSubscriptionCard {...Fixtures} />);
    expect(Fixtures.fetchQuotaCost).toHaveBeenCalled();
  });

  it('should have OSDSubscriptionTable', () => {
    render(<OSDSubscriptionCard {...Fixtures} />);

    expect(screen.getByRole('grid', { name: 'Quota Table' })).toBeInTheDocument();

    // +1 is to account for the heading row
    expect(screen.getAllByRole('row')).toHaveLength(Fixtures.expectedRowsForQuotaCost + 1);
  });

  it('displays the correct text when is marketplace', async () => {
    const newProps = { ...props, marketplace: true };
    const { container } = render(<OSDSubscriptionCard {...Fixtures} {...newProps} />);

    expect(await screen.findByText(marketplaceTexts.subscriptionLink)).toBeInTheDocument();
    expect(await screen.findByText(marketplaceTexts.subscriptionSubtitle)).toBeInTheDocument();
    expect(await screen.findByText(marketplaceTexts.subscriptionsDescription)).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('displays the correct text when is not marketplace', async () => {
    const { container } = render(<OSDSubscriptionCard {...Fixtures} {...props} />);

    expect(await screen.findByText(nonMarketplaceTexts.subscriptionLink)).toBeInTheDocument();
    expect(await screen.findByText(nonMarketplaceTexts.subscriptionSubtitle)).toBeInTheDocument();
    expect(
      await screen.findByText(nonMarketplaceTexts.subscriptionsDescription),
    ).toBeInTheDocument();

    await checkAccessibility(container);
  });
});
