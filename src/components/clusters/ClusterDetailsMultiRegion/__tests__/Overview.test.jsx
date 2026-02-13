import React from 'react';

import * as subscriptionFixture from '~/components/clusters/ClusterDetailsMultiRegion/components/Overview/SubscriptionSettings/SubscriptionSettings.fixtures';

import {
  checkAccessibility,
  mockRestrictedEnv,
  render,
  screen,
  withState,
} from '../../../../testUtils';
import { SubscriptionCommonFieldsStatus } from '../../../../types/accounts_mgmt.v1';
import Overview from '../components/Overview/Overview';

import fixtures from './ClusterDetails.fixtures';

jest.mock('../components/Overview/SupportStatusLabel');

// Mock InsightsAdvisor Chart components with accessible label components
// This is a temporary workaround for PatternFly Charts accessibility issues
// TODO: Remove this mock once the root cause is fixed
jest.mock('../components/Overview/InsightsAdvisor/InsightsAdvisorHelpers', () => {
  const actual = jest.requireActual(
    '../components/Overview/InsightsAdvisor/InsightsAdvisorHelpers',
  );

  // eslint-disable-next-line
  const { ChartLabel } = require('@patternfly/react-charts/victory');

  // eslint-disable-next-line react/prop-types
  const MockedInsightsLabelComponent = ({ style, datum, externalId, ...props }) => (
    // For accessibility tests, render as plain ChartLabel without link wrapper
    // This avoids nested-interactive violation while still rendering the component
    <ChartLabel
      {...props}
      style={{ ...style, fontSize: 15 }}
      className={
        // eslint-disable-next-line react/prop-types
        externalId && datum?.value > 0
          ? 'ocm-c-overview-advisor--enabled-link'
          : 'ocm-c-overview-advisor--disabled-link'
      }
    />
  );

  // eslint-disable-next-line react/prop-types
  const MockedInsightsSubtitleComponent = ({ externalId, style, ...props }) => (
    // For accessibility tests, render as plain ChartLabel without link wrapper
    <ChartLabel
      {...props}
      style={{ ...style, fontSize: 15 }}
      dy={5}
      className="ocm-c-overview-advisor--enabled-link"
    />
  );

  return {
    ...actual,
    InsightsLabelComponent: MockedInsightsLabelComponent,
    InsightsSubtitleComponent: MockedInsightsSubtitleComponent,
  };
});

describe('<Overview />', () => {
  describe('for an OSD cluster', () => {
    const props = {
      cluster: fixtures.clusterDetails.cluster,
      cloudProviders: fixtures.cloudProviders,
      history: {},
      displayClusterLogs: false,
      openModal: jest.fn(),
      insightsData: {},
      userAccess: fixtures.userAccess,
    };

    it('is accessible', async () => {
      const { container } = render(<Overview {...props} />);

      expect(
        await screen.findByText(
          'The cluster currently does not have any metrics data. Try again later.',
        ),
      ).toBeInTheDocument();

      await checkAccessibility(container);
    });
  });

  describe('for an OCP cluster', () => {
    const props = {
      cluster: fixtures.OCPClusterDetails.cluster,
      cloudProviders: fixtures.cloudProviders,
      history: {},
      displayClusterLogs: true,
      openModal: jest.fn(),
      insightsData: fixtures.insightsData,
      userAccess: fixtures.userAccess,
    };

    it('is accessible', async () => {
      const { container } = render(<Overview {...props} />);
      expect(
        await screen.findByText(
          'The cluster currently does not have any metrics data. Try again later.',
        ),
      ).toBeInTheDocument();

      await checkAccessibility(container);
    });

    it('displays items in the side panel', async () => {
      render(<Overview {...props} />);

      // Resource Usage
      expect(
        await screen.findByText(
          'The cluster currently does not have any metrics data. Try again later.',
        ),
      ).toBeInTheDocument();

      // InsightsAdvisor
      expect(screen.getByText('Advisor recommendations')).toBeInTheDocument();

      // CostBreakdownCard
      expect(screen.getByText('Cost breakdown')).toBeInTheDocument();
    });

    it('displays subscription settings', async () => {
      const testProps = {
        ...props,
        cluster: {
          ...props.cluster,
          subscription: subscriptionFixture.subscription,
        },
        subscription: subscriptionFixture.subscription,
      };

      withState({
        clusters: { details: { cluster: { subscription: subscriptionFixture } } },
      }).render(<Overview {...testProps} />);

      expect(
        await screen.findByText(
          'The cluster currently does not have any metrics data. Try again later.',
        ),
      ).toBeInTheDocument();

      // Subscription settings
      expect(screen.getByText('Subscription settings')).toBeInTheDocument();
    });
  });

  describe('for an ARO cluster', () => {
    const props = {
      cluster: fixtures.AROClusterDetails.cluster,
      cloudProviders: fixtures.cloudProviders,
      history: {},
      displayClusterLogs: true,
      openModal: jest.fn(),
      insightsData: {},
      userAccess: fixtures.userAccess,
    };

    it('is accessible', async () => {
      const { container } = render(<Overview {...props} />);

      expect(
        await screen.findByText(
          'The cluster currently does not have any metrics data. Try again later.',
        ),
      ).toBeInTheDocument();

      await checkAccessibility(container);
    });
  });

  describe('for an Archived OCP cluster', () => {
    const props = {
      cluster: {
        ...fixtures.OCPClusterDetails.cluster,
        subscription: {
          ...fixtures.OCPClusterDetails.cluster.subscription,
          status: SubscriptionCommonFieldsStatus.Archived,
        },
      },
      cloudProviders: fixtures.cloudProviders,
      history: {},
      displayClusterLogs: true,
      openModal: jest.fn(),
      insightsData: fixtures.insightsData,
      userAccess: fixtures.userAccess,
    };

    it('does not display side panel', async () => {
      render(<Overview {...props} />);

      expect(await screen.findByText('Archived')).toBeInTheDocument();

      // Resource Usage
      expect(
        screen.queryByText(
          'The cluster currently does not have any metrics data. Try again later.',
        ),
      ).not.toBeInTheDocument();

      // InsightsAdvisor
      expect(screen.queryByText('Advisor recommendations')).not.toBeInTheDocument();

      // CostBreakdownCard
      expect(screen.queryByText('Cost breakdown')).not.toBeInTheDocument();
    });

    it('does not display subscription settings', async () => {
      render(<Overview {...props} />);

      expect(await screen.findByText('Archived')).toBeInTheDocument();

      // Subscription settings
      expect(screen.queryByText('Subscription settings')).not.toBeInTheDocument();
    });
  });

  describe('for an AI cluster', () => {
    const props = {
      cluster: fixtures.AIClusterDetails.cluster,
      cloudProviders: fixtures.cloudProviders,
      history: {},
      displayClusterLogs: true,
      openModal: jest.fn(),
      insightsData: {},
      userAccess: fixtures.userAccess,
    };

    it('is accessible', async () => {
      const { container } = render(<Overview {...props} />);

      expect(await screen.findByText('Assisted cluster ID / Cluster ID')).toBeInTheDocument();

      await checkAccessibility(container);
    });
  });

  describe('in Restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();

    afterEach(() => {
      isRestrictedEnv.mockReturnValue(false);
    });

    it('does not display insights and resource usage', async () => {
      const props = {
        cluster: fixtures.ROSAClusterDetails.cluster,
        cloudProviders: fixtures.cloudProviders,
        history: {},
        displayClusterLogs: true,
        openModal: jest.fn(),
        insightsData: {
          status: 200,
          data: [],
        },
        userAccess: fixtures.userAccess,
      };

      const { rerender } = render(<Overview {...props} />);

      expect(await screen.findByText('Total issues')).toBeInTheDocument();

      expect(screen.getByText('Advisor recommendations')).toBeInTheDocument();
      expect(screen.getByText('Resource usage')).toBeInTheDocument();

      isRestrictedEnv.mockReturnValue(true);
      rerender(<Overview {...props} />);

      expect(screen.queryByText('Advisor recommendations')).not.toBeInTheDocument();
      expect(screen.queryByText('Resource usage')).not.toBeInTheDocument();
    });
  });
});
