import React from 'react';
import PropTypes from 'prop-types';

import { EmptyState, EmptyStateBody, Grid, GridItem, Spinner } from '@patternfly/react-core';

import { useGetClusterRouters } from '~/queries/ClusterDetailsQueries/NetworkingTab/useGetClusterRouters';

import ApplicationIngressCard from './components/ApplicationIngressCard';
import { ClusterIngressCard } from './components/ClusterIngressCard/ClusterIngressCard';
import NetworkConfigurationCard from './components/NetworkConfigurationCard';
import { VPCDetailsCard } from './components/VPCDetailsCard/VPCDetailsCard';
import VPCSubnetsCard from './components/VPCSubnetsCard';

import './Networking.scss';

const Networking = ({ cluster, refreshCluster, clusterID, isManaged, region }) => {
  const {
    data: clusterRouters,
    isLoading: isClusterRoutersLoading,
    isError: isClusterRoutersError,
  } = useGetClusterRouters(clusterID, isManaged, region);

  const network = cluster.network || {};
  const provider = cluster.cloud_provider.id ? cluster.cloud_provider.id : 'N/A';

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
          provider={provider}
          cluster={cluster}
          clusterRoutersData={clusterRouters}
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
          clusterRoutersData={clusterRouters}
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

Networking.propTypes = {
  cluster: PropTypes.object.isRequired,
  region: PropTypes.string,
  isManaged: PropTypes.bool,
  clusterID: PropTypes.string.isRequired,
  refreshCluster: PropTypes.func.isRequired,
};

export default Networking;
