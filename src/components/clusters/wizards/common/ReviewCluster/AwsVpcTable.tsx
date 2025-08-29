import React from 'react';

import { Grid, GridItem } from '@patternfly/react-core';

import { CloudVpc } from '~/types/clusters_mgmt.v1';

const getSubnetName = (vpc: CloudVpc, subnetId: string) => {
  const subnetInfo = vpc.aws_subnets?.find((subnet) => subnet.subnet_id === subnetId);
  return subnetInfo?.name || subnetId;
};

interface AwsVpcTableProps {
  vpc: CloudVpc;
  hasPublicSubnets: boolean;
  machinePoolsSubnets: {
    availabilityZone: string;
    privateSubnetId: string;
    publicSubnetId: string;
  }[];
}

const AwsVpcTable = ({ vpc, machinePoolsSubnets, hasPublicSubnets }: AwsVpcTableProps) => {
  const azColumns = hasPublicSubnets ? 2 : 3;
  const subnetColumns = hasPublicSubnets ? 5 : 9;

  return (
    <Grid className="ocm-aws-vpc-table">
      <GridItem md={azColumns}>
        <strong>Availability zone</strong>
      </GridItem>
      <GridItem md={subnetColumns}>
        <strong>Private subnet</strong>
      </GridItem>
      {hasPublicSubnets && (
        <GridItem md={subnetColumns}>
          <strong>Public subnet</strong>
        </GridItem>
      )}
      {machinePoolsSubnets.map((mpSubnet) => (
        <React.Fragment key={mpSubnet.privateSubnetId}>
          <GridItem md={azColumns}>{mpSubnet.availabilityZone}</GridItem>
          <GridItem md={subnetColumns}>{getSubnetName(vpc, mpSubnet.privateSubnetId)}</GridItem>
          {hasPublicSubnets && (
            <GridItem md={subnetColumns}>{getSubnetName(vpc, mpSubnet.publicSubnetId)}</GridItem>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default AwsVpcTable;
