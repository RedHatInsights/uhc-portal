import { useMutation } from '@tanstack/react-query';

import { isMPoolAz } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { EditMachinePoolValues } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/components/EditMachinePoolModal/hooks/useMachinePoolFormik';
import {
  buildMachinePoolRequest,
  buildNodePoolRequest,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/components/EditMachinePoolModal/utils';
import { isROSA } from '~/components/clusters/common/clusterStates';
import { getClusterService, getClusterServiceForRegion } from '~/services/clusterService';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

export const useEditCreateMachineOrNodePools = (
  isHypershift: boolean | undefined,
  cluster: ClusterFromSubscription,
  currentMachinePool?: MachinePool,
) => {
  const { data, isPending, isError, isSuccess, mutate, mutateAsync } = useMutation({
    mutationKey: ['createOrEditMachineOrNodePool', 'clusterService'],
    mutationFn: async ({
      region,
      values,
      currentMPId,
    }: {
      region?: string;
      values: EditMachinePoolValues;
      currentMPId?: string;
    }) => {
      const updatedSecureBoot = cluster.gcp?.security?.secure_boot === values.secure_boot;
      const clusterService = region ? getClusterServiceForRegion(region) : getClusterService();
      const isMultiZoneMachinePool = isMPoolAz(
        cluster,
        currentMachinePool?.availability_zones?.length,
      );
      const pool = isHypershift
        ? buildNodePoolRequest(values, {
            isEdit: !!currentMPId,
            isMultiZoneMachinePool,
          })
        : buildMachinePoolRequest(values, {
            isEdit: !!currentMPId,
            isMultiZoneMachinePool,
            isROSACluster: isROSA(cluster),
            isSecureBootUpdated: updatedSecureBoot,
          });

      if (currentMPId) {
        const request = isHypershift
          ? clusterService.patchNodePool
          : clusterService.patchMachinePool;
        const response = await request(cluster.id || '', currentMPId, pool);
        return response;
      }
      const request = isHypershift ? clusterService.addNodePool : clusterService.addMachinePool;
      const response = await request(cluster.id || '', pool);
      return response;
    },
  });

  return {
    data,
    isPending,
    isError,
    isSuccess,
    mutate,
    mutateAsync,
  };
};
