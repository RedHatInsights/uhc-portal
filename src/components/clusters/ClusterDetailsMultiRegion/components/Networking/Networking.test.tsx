import React from 'react';

import { useGetClusterRouters } from '~/queries/ClusterDetailsQueries/NetworkingTab/useGetClusterRouters';
import { render, screen } from '~/testUtils';
import type { AugmentedCluster } from '~/types/types';

import Networking from './Networking';

jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useGetClusterRouters', () => ({
  useGetClusterRouters: jest.fn(),
}));

jest.mock('./components/ApplicationIngressCard', () => ({
  __esModule: true,
  default: () => <div>ApplicationIngressCard</div>,
}));

jest.mock('./components/ClusterIngressCard/ClusterIngressCard', () => ({
  ClusterIngressCard: () => <div>ClusterIngressCard</div>,
}));

jest.mock('./components/NetworkConfigurationCard', () => ({
  __esModule: true,
  default: () => <div>NetworkConfigurationCard</div>,
}));

jest.mock('./components/VPCDetailsCard', () => ({
  __esModule: true,
  default: () => <div>VPCDetailsCard</div>,
}));

jest.mock('./components/VPCSubnetsCard', () => ({
  __esModule: true,
  default: () => <div>VPCSubnetsCard</div>,
}));

const useGetClusterRoutersMock = useGetClusterRouters as jest.Mock;

describe('<Networking />', () => {
  const refreshCluster = jest.fn();
  const defaultCluster = {
    network: { machine_cidr: '10.0.0.0/16' },
    cloud_provider: { id: 'gcp' },
    aws: { subnet_ids: ['subnet-1'] },
  } as AugmentedCluster;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading spinner while cluster routers are loading', () => {
    useGetClusterRoutersMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(
      <Networking
        cluster={defaultCluster}
        refreshCluster={refreshCluster}
        clusterID="cluster-1"
        isManaged
      />,
    );

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('ClusterIngressCard')).not.toBeInTheDocument();
  });

  it('renders networking cards when cluster routers have loaded', () => {
    useGetClusterRoutersMock.mockReturnValue({
      data: [{ id: 'router-1' }],
      isLoading: false,
      isError: false,
    });

    render(
      <Networking
        cluster={defaultCluster}
        refreshCluster={refreshCluster}
        clusterID="cluster-1"
        isManaged
        region="us-east1"
      />,
    );

    expect(useGetClusterRoutersMock).toHaveBeenCalledWith('cluster-1', true, 'us-east1');
    expect(screen.getByText('ClusterIngressCard')).toBeInTheDocument();
    expect(screen.getByText('NetworkConfigurationCard')).toBeInTheDocument();
    expect(screen.getByText('ApplicationIngressCard')).toBeInTheDocument();
    expect(screen.getByText('VPCSubnetsCard')).toBeInTheDocument();
    expect(screen.getByText('VPCDetailsCard')).toBeInTheDocument();
  });

  it('renders networking cards when routers fail to load', () => {
    useGetClusterRoutersMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(
      <Networking cluster={defaultCluster} refreshCluster={refreshCluster} clusterID="cluster-1" />,
    );

    expect(screen.queryByLabelText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('ClusterIngressCard')).toBeInTheDocument();
  });

  it('defaults isManaged to false when omitted', () => {
    useGetClusterRoutersMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <Networking
        cluster={{ cloud_provider: undefined } as AugmentedCluster}
        refreshCluster={refreshCluster}
        clusterID="cluster-1"
      />,
    );

    expect(useGetClusterRoutersMock).toHaveBeenCalledWith('cluster-1', false, undefined);
    expect(screen.getByText('VPCDetailsCard')).toBeInTheDocument();
  });
});
