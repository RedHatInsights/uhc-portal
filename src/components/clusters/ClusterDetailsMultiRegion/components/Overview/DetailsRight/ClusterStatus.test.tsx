import React from 'react';

import { defaultClusterFromSubscription } from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import { checkAccessibility, render, screen } from '~/testUtils';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';
import { ClusterFromSubscription } from '~/types/types';

import { ClusterStatus } from './ClusterStatus';

const cluster: ClusterFromSubscription = {
  ...defaultClusterFromSubscription,
  name: 'Some Cluster',
  id: 'cluster-id',
  state: ClusterState.ready,
};

const machinePools = [
  {
    status: { current_replicas: 2 },
    replicas: 2,
  },
  {
    status: { current_replicas: 3 },
    replicas: 4,
  },
];

const machinePoolsAutoScale = [
  {
    autoscaling: { min_replicas: 2, max_replicas: 3 },
    status: { current_replicas: 2 },
  },
  {
    autoscaling: { min_replicas: 2, max_replicas: 3 },
    status: { current_replicas: 3 },
  },
  {
    autoscaling: { min_replicas: 2, max_replicas: 3 },
    status: { current_replicas: 1 },
  },
  {
    autoscaling: { min_replicas: 2, max_replicas: 3 },
    status: { current_replicas: 4 },
  },
];

const machinePoolsAutoScaleReady = [
  {
    autoscaling: { min_replicas: 2, max_replicas: 4 },
    status: { current_replicas: 2 },
  },
  {
    autoscaling: { min_replicas: 2, max_replicas: 4 },
    status: { current_replicas: 2 },
  },
];

const machinePoolsAutoScaleZeroMin = [
  {
    autoscaling: { min_replicas: 0, max_replicas: 3 },
    status: { current_replicas: 0 },
  },
];

describe('<ClusterStatus />', () => {
  describe('Hypershift is not enabled', () => {
    it('is accessible', async () => {
      // Arrange
      const { container } = render(<ClusterStatus cluster={cluster} limitedSupport={false} />);

      // Assert
      await checkAccessibility(container);
    });

    it('shows only the cluster-wide status', () => {
      // Arrange
      render(<ClusterStatus cluster={cluster} limitedSupport={false} />);

      // Assert
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.queryByText('Control plane:')).not.toBeInTheDocument();
      expect(screen.queryByText('Machine pools:')).not.toBeInTheDocument();
    });
  });

  describe('Hypershift is enabled', () => {
    it('is accessible', async () => {
      // Arrange
      const { container } = render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={machinePools}
        />,
      );

      // Assert
      await checkAccessibility(container);
    });

    it('shows control plane and machine pools statuses', () => {
      // Arrange
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={machinePools}
        />,
      );

      // Assert
      expect(screen.getByText('Control plane:')).toBeInTheDocument();
      expect(screen.getByText('Machine pools:')).toBeInTheDocument();
    });

    it('shows correct number of machine pools in "ready like" status', () => {
      // Arrange
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={machinePools}
        />,
      );

      // Assert
      expect(screen.getByText('Pending 1 / 2')).toBeInTheDocument();
    });

    it('shows correct number of ready machine pools when one machine pool has 0 replicas', () => {
      // Arrange
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={[...machinePools, { status: { current_replicas: 0 }, replicas: 0 }]}
        />,
      );

      // Assert
      expect(screen.getByText('Pending 2 / 3')).toBeInTheDocument();
    });

    it('shows correct number of autoscaling machine pools in "ready like" status ', () => {
      // Arrange
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={machinePoolsAutoScale}
        />,
      );

      // Assert
      expect(screen.getByText('Pending 2 / 4')).toBeInTheDocument();
    });

    it('shows all machine pools are in "ready like" status ', () => {
      // Arrange
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={machinePoolsAutoScaleReady}
        />,
      );

      // Assert
      expect(screen.getByText('Ready 2 / 2')).toBeInTheDocument();
    });

    it('shows autoscaling pool with min_replicas 0 and current_replicas 0 as ready', () => {
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={machinePoolsAutoScaleZeroMin}
        />,
      );

      expect(screen.getByText('Ready 1 / 1')).toBeInTheDocument();
    });

    it('shows autoscaling pool with min_replicas 0 and a status message as not ready', () => {
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={[
            {
              autoscaling: { min_replicas: 0, max_replicas: 3 },
              status: { current_replicas: 0, message: 'waitingOnMachine' },
            },
          ]}
        />,
      );

      expect(screen.getByText('Pending 0 / 1')).toBeInTheDocument();
    });

    it('counts zero-min autoscaling pools alongside normal pools correctly', () => {
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={[
            {
              autoscaling: { min_replicas: 0, max_replicas: 3 },
              status: { current_replicas: 0 },
            },
            {
              autoscaling: { min_replicas: 2, max_replicas: 4 },
              status: { current_replicas: 3 },
            },
          ]}
        />,
      );

      expect(screen.getByText('Ready 2 / 2')).toBeInTheDocument();
    });

    it('does not count pool without current_replicas as ready', () => {
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={[{ replicas: 2, status: {} }]}
        />,
      );

      expect(screen.getByText('Pending 0 / 1')).toBeInTheDocument();
    });

    it('shows uninstalling state when cluster is uninstalling', () => {
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true }, state: ClusterState.uninstalling }}
          limitedSupport={false}
          machinePools={machinePools}
        />,
      );

      expect(screen.getByTestId('machine-pools-status')).toHaveTextContent('Uninstalling');
    });

    it('shows deleted when there are no machine pools and cluster is ready', () => {
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true } }}
          limitedSupport={false}
          machinePools={[]}
        />,
      );

      expect(screen.getByTestId('machine-pools-status')).toHaveTextContent('Deleted 0 / 0');
    });

    it('shows pending when there are no machine pools and cluster is installing', () => {
      render(
        <ClusterStatus
          cluster={{ ...cluster, hypershift: { enabled: true }, state: ClusterState.installing }}
          limitedSupport={false}
          machinePools={[]}
        />,
      );
      expect(screen.getByTestId('machine-pools-status')).toHaveTextContent('Pending 0 / 0');
    });
  });
});
