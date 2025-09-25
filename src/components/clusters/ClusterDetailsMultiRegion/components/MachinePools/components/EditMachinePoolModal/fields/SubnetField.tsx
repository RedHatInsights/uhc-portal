import * as React from 'react';
import { useField } from 'formik';

import { Spinner } from '@patternfly/react-core';

import { RefreshClusterVPCAlert } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/common/RefreshClusterVPCAlert';
import { SubnetSelectField } from '~/components/clusters/common/SubnetSelectField';
import { useAWSVPCFromCluster } from '~/components/clusters/common/useAWSVPCFromCluster';
import { MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

const fieldId = 'privateSubnetId';

const getSubnetIds = (machinePoolOrNodePool: MachinePool | NodePool): string[] => {
  const { subnet, subnets } = machinePoolOrNodePool as any;
  const subnetArray = subnet ? [subnet] : subnets || [];
  return Array.isArray(subnetArray) ? subnetArray : [subnetArray];
};

const SubnetField = ({
  cluster,
  region,
  machinePools = [],
}: {
  cluster: ClusterFromSubscription;
  region?: string;
  machinePools?: MachinePool[];
}) => {
  const [inputField, metaField, { setValue }] = useField<string | undefined>(fieldId);
  const { clusterVpc, isLoading, hasError, refreshVPC } = useAWSVPCFromCluster(cluster, region);

  const usedSubnetIds = React.useMemo(
    () =>
      machinePools.flatMap((nodePool) => getSubnetIds(nodePool)).filter((subnetId) => !!subnetId),
    [machinePools],
  );

  const fieldProps = React.useMemo(
    () => ({
      input: {
        onChange: (subnetId: string | undefined) => {
          setValue(subnetId);
        },
        value: inputField.value,
        name: inputField.name,
      },
      meta: {
        error: metaField.touched ? metaField.error : undefined,
        touched: metaField.touched,
      },
    }),
    [inputField.value, inputField.name, metaField.error, metaField.touched, setValue],
  );

  if (isLoading) {
    return <Spinner size="md">Loading the cluster VPC</Spinner>;
  }

  if (!clusterVpc || hasError) {
    return <RefreshClusterVPCAlert isLoading={isLoading} refreshVPC={refreshVPC} />;
  }

  return (
    <SubnetSelectField
      name={fieldId}
      privacy="private"
      label="Private subnet name"
      isRequired
      selectedVPC={clusterVpc}
      usedSubnetIds={usedSubnetIds}
      {...fieldProps}
    />
  );
};

export default SubnetField;
