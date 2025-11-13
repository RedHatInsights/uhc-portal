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

    it.skip('is accessible', async () => {
      /*
      This is skipped due to an issue within PatternFly Charts ChartLegend component.
      The basis of the problem is that the legend has links 
     
      The fix is in src/components/dashboard/InsightsAdvisorCard/ChartByGroups.jsx
      change the legendComponent prop to the ChartPie to  a custom component
      - aka do not use the ChartLegend component.
    
      */
      const { container } = render(<Overview {...props} />);
      expect(
        await screen.findByText(
          'The cluster currently does not have any metrics data. Try again later.',
        ),
      ).toBeInTheDocument();

      // This fails due to numerous accessibility issues
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

    it.skip('displays subscription settings', async () => {
      // To function correctly this test needs a lot of redux setup

      // Recommend testing SubscriptionSettings directly

      withState({
        clusters: { details: { cluster: { subscription: subscriptionFixture } } },
      }).render(<Overview {...props} />);

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
