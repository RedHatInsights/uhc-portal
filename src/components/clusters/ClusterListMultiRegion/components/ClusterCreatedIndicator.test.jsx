import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import { checkAccessibility, render, screen } from '~/testUtils';

import { subscriptionSettings } from '../../../../common/subscriptionTypes';
import { SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel } from '../../../../types/accounts_mgmt.v1';

import ClusterCreatedIndicator from './ClusterCreatedIndicator';

const { SUPPORT_LEVEL, EVALUATION_EXPIRATION_DATE } = subscriptionSettings;

describe('<ClusterCreatedIndicator />', () => {
  it('should display "N/A" when the cluster has no subscription info', async () => {
    const cluster = {
      managed: false,
      subscription: {
        [EVALUATION_EXPIRATION_DATE]: '2020-01-01T12:00:00Z',
      },
    };

    const { container } = render(<ClusterCreatedIndicator cluster={cluster} />);

    expect(container).toHaveTextContent('N/A');
    await checkAccessibility(container);
  });

  it('should show created date when cluster is OSD', () => {
    const creationTimeStamp = '2020-01-01T12:00:00Z';
    const cluster = {
      managed: true,
      subscription: {
        [SUPPORT_LEVEL]: SubscriptionCommonFieldsSupportLevel.Self_Support,
      },
      creation_timestamp: creationTimeStamp,
    };

    const { container } = render(<ClusterCreatedIndicator cluster={cluster} />);
    expect(container).toHaveTextContent('01 Jan 2020');
  });

  it('should show created date when it has a valid support', () => {
    const creationTimeStamp = '2020-01-01T12:00:00Z';
    const cluster = {
      managed: false,
      subscription: {
        [SUPPORT_LEVEL]: SubscriptionCommonFieldsSupportLevel.Premium,
      },
      creation_timestamp: creationTimeStamp,
    };

    const { container } = render(<ClusterCreatedIndicator cluster={cluster} />);
    expect(container).toHaveTextContent('01 Jan 2020');
  });

  it('should have "not supported" popover when cluster has Eval support level', async () => {
    const creationTimeStamp = '2020-06-15T12:00:00Z';
    const cluster = {
      managed: false,
      subscription: {
        [SUPPORT_LEVEL]: SubscriptionCommonFieldsSupportLevel.Eval,
        eval_expiration_date: '2020-08-15T12:00:00Z',
      },
      creation_timestamp: creationTimeStamp,
    };

    const { user } = render(<ClusterCreatedIndicator cluster={cluster} />);

    expect(screen.getByText('15 Jun 2020')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(/Your OCP cluster is not/i);
    expect(dialog).toHaveTextContent(/Please enable the support by/i);
    expect(dialog).not.toHaveTextContent(/Invalid Date/i);
    expect(screen.getByRole('link', { name: /OCP subscriptions/i })).toHaveAttribute(
      'href',
      docLinks.RH_OCP_SUBSCRIPTIONS,
    );
  });

  it('should omit support deadline when Eval cluster has no eval_expiration_date', async () => {
    const cluster = {
      managed: false,
      subscription: {
        [SUPPORT_LEVEL]: SubscriptionCommonFieldsSupportLevel.Eval,
      },
      creation_timestamp: '2020-06-15T12:00:00Z',
    };

    const { user } = render(<ClusterCreatedIndicator cluster={cluster} />);
    await user.click(screen.getByRole('button'));
    const dialog = await screen.findByRole('dialog');

    expect(dialog).toHaveTextContent(/Your OCP cluster is not/i);
    expect(dialog).toHaveTextContent(/Your cluster will remain functional/i);
    expect(dialog).not.toHaveTextContent(/Please enable the support by/i);
    expect(dialog).not.toHaveTextContent(/Invalid Date/i);
  });

  it('should show "N/A" with warning when Eval cluster has no creation timestamp', () => {
    const cluster = {
      managed: false,
      subscription: {
        [SUPPORT_LEVEL]: SubscriptionCommonFieldsSupportLevel.Eval,
      },
    };

    render(<ClusterCreatedIndicator cluster={cluster} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should have "not supported" popover when support level is None', async () => {
    const creationTimeStamp = '2020-01-01T00:00:00Z';
    const cluster = {
      managed: false,
      subscription: {
        [SUPPORT_LEVEL]: SubscriptionCommonFieldsSupportLevel.None,
      },
      creation_timestamp: creationTimeStamp,
    };
    const { user } = render(<ClusterCreatedIndicator cluster={cluster} />);
    await user.click(screen.getByRole('button'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    expect(screen.getByText('Your cluster is not', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /supported/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /OCP subscriptions/i })).toHaveAttribute(
      'href',
      docLinks.RH_OCP_SUBSCRIPTIONS,
    );
  });
});
