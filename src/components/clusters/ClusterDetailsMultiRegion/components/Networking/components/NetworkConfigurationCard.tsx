import React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import type { NetworkWithOvnSubnets } from '../NetworkingHelpers';

import './NetworkConfigurationCard.scss';

export type { NetworkWithOvnSubnets };

type NetworkConfigurationCardProps = {
  network: NetworkWithOvnSubnets;
  shouldShowOvnNetworkDetails?: boolean;
};

const NetworkConfigurationCard = ({
  network,
  shouldShowOvnNetworkDetails = false,
}: NetworkConfigurationCardProps) => {
  const hostPrefix =
    network.host_prefix !== undefined && network.host_prefix !== null
      ? `/${network.host_prefix}`
      : 'N/A';

  return (
    <Card className="ocm-c-networking-network-configuration__card">
      <CardTitle>Network CIDRs</CardTitle>
      <CardBody className="ocm-c-networking-network-configuration__card--body">
        <DescriptionList>
          {shouldShowOvnNetworkDetails && network.type ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Network type</DescriptionListTerm>
              <DescriptionListDescription>{network.type}</DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
          <DescriptionListGroup>
            <DescriptionListTerm>Machine CIDR</DescriptionListTerm>
            <DescriptionListDescription>{network.machine_cidr || 'N/A'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Service CIDR</DescriptionListTerm>
            <DescriptionListDescription>{network.service_cidr || 'N/A'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Pod CIDR</DescriptionListTerm>
            <DescriptionListDescription>{network.pod_cidr || 'N/A'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Host prefix</DescriptionListTerm>
            <DescriptionListDescription>{hostPrefix}</DescriptionListDescription>
          </DescriptionListGroup>
          {shouldShowOvnNetworkDetails && network.join_ipv4 ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Join subnet</DescriptionListTerm>
              <DescriptionListDescription>{network.join_ipv4}</DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
          {shouldShowOvnNetworkDetails && network.transit_ipv4 ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Transit subnet</DescriptionListTerm>
              <DescriptionListDescription>{network.transit_ipv4}</DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
          {shouldShowOvnNetworkDetails && network.masquerade_ipv4 ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Masquerade subnet</DescriptionListTerm>
              <DescriptionListDescription>{network.masquerade_ipv4}</DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default NetworkConfigurationCard;
