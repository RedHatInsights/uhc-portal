import React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
} from '@patternfly/react-core';

import { HCP_OVN_IP4_SUBNETS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import type { ClusterFromSubscription } from '~/types/types';

import {
  canShowOvnNetworkDetails,
  type NetworkWithOvnSubnets,
} from '../Networking/NetworkingHelpers';

type ClusterNetworkProps = {
  cluster: ClusterFromSubscription;
};

function ClusterNetwork({ cluster }: ClusterNetworkProps) {
  const isHcpOvnIp4SubnetsEnabled = useFeatureGate(HCP_OVN_IP4_SUBNETS);

  if (!cluster.managed || !cluster.network) {
    return null;
  }

  const network = cluster.network as NetworkWithOvnSubnets;
  const shouldShowOvnNetworkDetails = canShowOvnNetworkDetails(cluster, isHcpOvnIp4SubnetsEnabled);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Network</DescriptionListTerm>
      <DescriptionListDescription>
        <dl className="pf-v6-l-stack">
          {shouldShowOvnNetworkDetails && network.type ? (
            <Flex>
              <dt>Network type: </dt>
              <dd data-testid="networkType">{network.type}</dd>
            </Flex>
          ) : null}
          {network.machine_cidr ? (
            <Flex>
              <dt>Machine CIDR: </dt>
              <dd data-testid="machineCIDR">{network.machine_cidr}</dd>
            </Flex>
          ) : null}
          {network.service_cidr ? (
            <Flex>
              <dt>Service CIDR: </dt>
              <dd data-testid="serviceCIDR">{network.service_cidr}</dd>
            </Flex>
          ) : null}
          {network.pod_cidr ? (
            <Flex>
              <dt>Pod CIDR: </dt>
              <dd data-testid="podCIDR">{network.pod_cidr}</dd>
            </Flex>
          ) : null}
          {network.host_prefix ? (
            <Flex>
              <dt>Host prefix: </dt>
              <dd data-testid="hostPrefix">{network.host_prefix}</dd>
            </Flex>
          ) : null}
          {shouldShowOvnNetworkDetails && network.join_ipv4 ? (
            <Flex>
              <dt>Join subnet: </dt>
              <dd data-testid="joinSubnet">{network.join_ipv4}</dd>
            </Flex>
          ) : null}
          {shouldShowOvnNetworkDetails && network.transit_ipv4 ? (
            <Flex>
              <dt>Transit subnet: </dt>
              <dd data-testid="transitSubnet">{network.transit_ipv4}</dd>
            </Flex>
          ) : null}
          {shouldShowOvnNetworkDetails && network.masquerade_ipv4 ? (
            <Flex>
              <dt>Masquerade subnet: </dt>
              <dd data-testid="masqueradeSubnet">{network.masquerade_ipv4}</dd>
            </Flex>
          ) : null}
        </dl>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
}

export default ClusterNetwork;
