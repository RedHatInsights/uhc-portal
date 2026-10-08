import React from 'react';

import { EmptyState, EmptyStateBody, Grid, GridItem, Spinner } from '@patternfly/react-core';

import { useGetClusterRouters } from '~/queries/ClusterDetailsQueries/NetworkingTab/useGetClusterRouters';
import type { AugmentedCluster } from '~/types/types';

import ApplicationIngressCard from './components/ApplicationIngressCard';
import { ClusterIngressCard } from './components/ClusterIngressCard/ClusterIngressCard';
import NetworkConfigurationCard from './components/NetworkConfigurationCard';
import VPCDetailsCard from './components/VPCDetailsCard';
import VPCSubnetsCard from './components/VPCSubnetsCard';

import './Networking.scss';

type NetworkingProps = {
  cluster: AugmentedCluster;
  refreshCluster: () => void;
  clusterID: string;
  isManaged?: boolean;
  region?: string;
};

const Networking = ({
  cluster,
  refreshCluster,
  clusterID,
  isManaged = false,
  region,
}: NetworkingProps) => {
  const {
    data: clusterRouters,
    isLoading: isClusterRoutersLoading,
    isError: isClusterRoutersError,
  } = useGetClusterRouters(clusterID, isManaged, region);

  const network = cluster.network || {};
  const provider = cluster.cloud_provider?.id ? cluster.cloud_provider.id : 'N/A';
  const clusterRoutersData = clusterRouters ?? [];

  if (isClusterRoutersLoading && !isClusterRoutersError) {
    return (
      <EmptyState>
        <EmptyStateBody>
          <div className="pf-v6-u-text-align-center">
            <Spinner size="lg" aria-label="Loading..." />
          </div>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Grid hasGutter>
      <GridItem lg={9} md={12} className="networking-grid-item">
        <ClusterIngressCard
          refreshCluster={refreshCluster}
          cluster={cluster}
          clusterRoutersData={clusterRoutersData}
        />
      </GridItem>
      <GridItem lg={3} md={12} className="networking-grid-item">
        <NetworkConfigurationCard network={network} />
      </GridItem>
      <GridItem lg={9} md={12} className="networking-grid-item">
        <ApplicationIngressCard
          provider={provider}
          cluster={cluster}
          refreshCluster={refreshCluster}
          clusterRoutersData={clusterRoutersData}
        />
      </GridItem>
      <GridItem lg={3} md={12} className="networking-grid-item">
        <VPCSubnetsCard awsSubnets={cluster.aws?.subnet_ids} gcpNetwork={cluster.gcp_network} />
      </GridItem>
      <GridItem lg={9} md={12} className="networking-grid-item">
        <VPCDetailsCard cluster={cluster} />
      </GridItem>
    </Grid>
  );
};

export default Networking;
