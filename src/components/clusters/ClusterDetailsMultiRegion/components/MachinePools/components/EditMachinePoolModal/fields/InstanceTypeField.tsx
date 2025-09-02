import * as React from 'react';

import { GridItem } from '@patternfly/react-core';

import { normalizeProductID } from '~/common/normalize';
import { isMultiAZ } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { MachineTypeSelection } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import { MachineTypesResponse } from '~/queries/types';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';
import { Cluster } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

type InstanceTypeFieldProps = {
  cluster: ClusterFromSubscription;
  machineTypesResponse: MachineTypesResponse;
};

const InstanceTypeField = ({ cluster, machineTypesResponse }: InstanceTypeFieldProps) => (
  <GridItem>
    <MachineTypeSelection
      machineTypesResponse={machineTypesResponse}
      isMultiAz={isMultiAZ(cluster)}
      isBYOC={!!cluster.ccs?.enabled}
      cloudProviderID={cluster.cloud_provider?.id as 'aws' | 'gcp' | undefined}
      productId={normalizeProductID(cluster.product?.id)}
      isMachinePool
      billingModel={
        (cluster as Cluster).billing_model ||
        ((cluster as ClusterFromSubscription).subscription
          ?.cluster_billing_model as Cluster['billing_model']) ||
        SubscriptionCommonFieldsClusterBillingModel.standard
      }
      inModal
    />
  </GridItem>
);

export default InstanceTypeField;
