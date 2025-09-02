import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { normalizedProducts } from '../../../../../../common/subscriptionTypes';

import SubscriptionSettings from './SubscriptionSettings';
import * as fixtures from './SubscriptionSettings.fixtures';

describe('<SubscriptionSettings />', () => {
  it('should render for OCP', async () => {
    const newProps = { ...fixtures };
    newProps.subscription.plan.id = normalizedProducts.OCP;
    newProps.subscription.plan.type = normalizedProducts.OCP;

    const { container } = render(<SubscriptionSettings {...newProps} />);
    expect(screen.getByRole('button', { name: 'Edit subscription settings' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Edit subscription settings' })).not.toHaveAttribute(
      'aria-disabled',
    );
    await checkAccessibility(container);
  });

  it('should not render if not OCP', () => {
    const newProps = { ...fixtures };
    newProps.subscription.plan.id = normalizedProducts.OSD;
    newProps.subscription.plan.type = normalizedProducts.OSD;

    const { container } = render(<SubscriptionSettings {...newProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should show contact sales', () => {
    const newProps = { ...fixtures };
    newProps.subscription.plan.id = normalizedProducts.OCP;
    newProps.subscription.plan.type = normalizedProducts.OCP;
    newProps.canSubscribeOCP = false;

    render(<SubscriptionSettings {...newProps} />);
    expect(screen.getByRole('button', { name: 'Edit subscription settings' })).toBeDisabled();

    expect(screen.getByRole('link', { name: 'Contact sales (new window or tab)' })).toHaveAttribute(
      'href',
      'https://www.redhat.com/en/contact',
    );
  });

  it('should hide Edit', () => {
    const newProps = { ...fixtures };
    newProps.subscription.plan.id = normalizedProducts.OCP;
    newProps.subscription.plan.type = normalizedProducts.OCP;
    newProps.canEdit = false;

    render(<SubscriptionSettings {...newProps} />);
    expect(
      screen.queryByRole('button', { name: 'Edit subscription settings' }),
    ).not.toBeInTheDocument();
  });
});
