import React from 'react';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { checkAccessibility, render, screen } from '~/testUtils';

import { subscriptionSettings } from '../../../../common/subscriptionTypes';
import { SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel } from '../../../../types/accounts_mgmt.v1';
import SubscriptionCompliancy from '../components/ClusterDetailsTop/components/SubscriptionCompliancy';

import fixtures from './ClusterDetails.fixtures';

const { SUPPORT_LEVEL } = subscriptionSettings;

describe('<SubscriptionCompliancy />', () => {
  const { OCPClusterDetails, clusterDetails, organization } = fixtures;
  const openModal = jest.fn();

  const props = {
    cluster: OCPClusterDetails.cluster,
    canSubscribeOCP: false,
    organization,
    openModal,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should warn during evaluation period', async () => {
    const cluster = { ...OCPClusterDetails.cluster, canEdit: true };
    cluster.subscription[SUPPORT_LEVEL] = SubscriptionCommonFieldsSupportLevel.Eval;
    cluster.subscription.capabilities = [
      {
        name: subscriptionCapabilities.SUBSCRIBED_OCP,
        value: 'true',
        inherited: true,
      },
    ];
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);
    expect(screen.getByText('Warning alert:')).toBeInTheDocument();
    expect(screen.getByText('OpenShift cluster support status')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'The cluster owner or an Organization Administrator can edit subscription settings to enable support.',
        { exact: false },
      ),
    ).not.toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('should warn during evaluation period without an ability to edit', async () => {
    const cluster = { ...OCPClusterDetails.cluster, canEdit: true };
    cluster.subscription[SUPPORT_LEVEL] = SubscriptionCommonFieldsSupportLevel.Eval;
    cluster.subscription.capabilities = [
      {
        name: subscriptionCapabilities.SUBSCRIBED_OCP,
        value: 'true',
        inherited: true,
      },
    ];
    cluster.canEdit = false;
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);
    expect(screen.getByText('Warning alert:')).toBeInTheDocument();
    expect(screen.getByText('OpenShift cluster support status')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The cluster owner or an Organization Administrator can edit subscription settings to enable support.',
        { exact: false },
      ),
    ).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('should show the support deadline when eval_expiration_date is present', async () => {
    const cluster = { ...OCPClusterDetails.cluster, canEdit: true };
    cluster.subscription[SUPPORT_LEVEL] = SubscriptionCommonFieldsSupportLevel.Eval;
    cluster.subscription.eval_expiration_date = '2020-08-15T12:00:00Z';
    cluster.subscription.capabilities = [
      {
        name: subscriptionCapabilities.SUBSCRIBED_OCP,
        value: 'true',
        inherited: true,
      },
    ];
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);

    expect(screen.getByText('Warning alert:')).toBeInTheDocument();
    expect(screen.getByText(/Please enable support by/i)).toBeInTheDocument();
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('should not show Invalid Date when eval_expiration_date is missing', async () => {
    const cluster = { ...OCPClusterDetails.cluster, canEdit: true };
    cluster.subscription[SUPPORT_LEVEL] = SubscriptionCommonFieldsSupportLevel.Eval;
    cluster.subscription.eval_expiration_date = undefined;
    cluster.subscription.capabilities = [
      {
        name: subscriptionCapabilities.SUBSCRIBED_OCP,
        value: 'true',
        inherited: true,
      },
    ];
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);

    expect(screen.getByText('Warning alert:')).toBeInTheDocument();
    expect(screen.queryByText(/Please enable support by/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('should warn when evaluation is expired', async () => {
    const cluster = { ...OCPClusterDetails.cluster, canEdit: true };
    cluster.subscription[SUPPORT_LEVEL] = SubscriptionCommonFieldsSupportLevel.None;
    cluster.subscription.capabilities = [];
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);
    expect(screen.getByText('Danger alert:')).toBeInTheDocument();
    expect(screen.getByText('Your OpenShift cluster is not supported')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'The cluster owner or an Organization Administrator can edit subscription settings to enable support.',
        { exact: false },
      ),
    ).not.toBeInTheDocument();
    await checkAccessibility(container);
  });
  it('should warn when evaluation is expired without an ability to edit', async () => {
    const cluster = { ...OCPClusterDetails.cluster, canEdit: true };
    cluster.subscription[SUPPORT_LEVEL] = SubscriptionCommonFieldsSupportLevel.None;
    cluster.subscription.capabilities = [];
    cluster.canEdit = false;
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);
    expect(screen.getByText('Danger alert:')).toBeInTheDocument();
    expect(screen.getByText('Your OpenShift cluster is not supported')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The cluster owner or an Organization Administrator can edit subscription settings to enable support.',
        { exact: false },
      ),
    ).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('should not render when it has a valid support', () => {
    const cluster = { ...OCPClusterDetails.cluster };
    cluster.subscription[SUPPORT_LEVEL] = SubscriptionCommonFieldsSupportLevel.Standard;
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should not render when it is not OCP', () => {
    const cluster = { ...clusterDetails.cluster };
    const newProps = { ...props, cluster };
    const { container } = render(<SubscriptionCompliancy {...newProps} />);
    expect(container).toBeEmptyDOMElement();
  });
});
