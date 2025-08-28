import semver from 'semver';

import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { normalizeNodePool } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import { isControlPlaneValidForMachinePool } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/UpdateMachinePools/updateMachinePoolsHelpers';
import { formatErrorData } from '~/queries/helpers';
import { queryConstants } from '~/queries/queriesConstants';
import { useGlobalState } from '~/redux/hooks';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';

const useIsModalOpen = () => useGlobalState((state) => !!state.modal?.modalName);

const useFetchNodePoolWithUpgradePolicies = (
  clusterID: string,
  clusterVersion: string,
  isHypershiftCluster: boolean,
  region?: any,
  clusterVersionRaw?: string,
) => {
  const isModalOpen = useIsModalOpen();
  const { isLoading, data, isError, error, refetch, isRefetching } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'nodePoolWithUpgradePolicies',
      'clusterService',
      clusterID,
      clusterVersion,
      region,
    ],
    queryFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(region);
        const nodePools = await clusterService.getNodePools(clusterID);

        const promiseArray = nodePools.data.items?.map(async (pool) => {
          if (
            !clusterVersion ||
            !pool.version ||
            !semver.gt(
              semver.coerce(clusterVersionRaw, { includePrerelease: true })?.version || '',
              semver.coerce(pool.version?.raw_id, { includePrerelease: true })?.version || '',
            ) ||
            !isControlPlaneValidForMachinePool(pool, clusterVersionRaw || '')
          ) {
            return pool;
          }

          try {
            if (pool.id) {
              const poolUpgradePolicies = await clusterService.getNodePoolUpgradePolicies(
                clusterID,
                pool.id,
              );
              return { ...pool, upgradePolicies: poolUpgradePolicies.data };
            }
          } catch (errorResponse: any) {
            return {
              ...pool,
              upgradePolicies: {
                errorMessage:
                  errorResponse.response?.data?.reason ||
                  errorResponse.message ||
                  'There was an error fetching upgrade policies for this machine pool.',
                items: [],
              },
            };
          }
          return null;
        });
        // @ts-ignore  error due to using an older compiler
        const result = await Promise.allSettled(promiseArray);

        const nodePoolsWithUpgradePolicies = result.map((pool: any) => pool.value);

        const newResponse = {
          ...nodePools,
          data: { ...nodePools.data, items: nodePoolsWithUpgradePolicies },
        };
        return newResponse;
      }
      const nodePools = await clusterService.getNodePools(clusterID);

      const promiseArray = nodePools.data.items?.map(async (pool) => {
        if (
          !clusterVersion ||
          !pool.version ||
          !semver.gt(
            semver.coerce(clusterVersionRaw, { includePrerelease: true })?.version || '',
            semver.coerce(pool.version?.raw_id, { includePrerelease: true })?.version || '',
          ) ||
          !isControlPlaneValidForMachinePool(pool, clusterVersionRaw || '')
        ) {
          return pool;
        }

        try {
          if (pool.id) {
            const poolUpgradePolicies = await clusterService.getNodePoolUpgradePolicies(
              clusterID,
              pool.id,
            );
            return { ...pool, upgradePolicies: poolUpgradePolicies.data };
          }
        } catch (errorResponse: any) {
          return {
            ...pool,
            upgradePolicies: {
              errorMessage:
                errorResponse.response?.data?.reason ||
                errorResponse.message ||
                'There was an error fetching upgrade policies for this machine pool.',
              items: [],
            },
          };
        }
        return null;
      });
      // @ts-ignore  error due to using an older compiler
      const result = await Promise.allSettled(promiseArray);

      const nodePoolsWithUpgradePolicies = result.map((pool: any) => pool.value);

      const newResponse = {
        ...nodePools,
        data: { ...nodePools.data, items: nodePoolsWithUpgradePolicies },
      };
      return newResponse;
    },
    refetchOnWindowFocus: !isModalOpen,
    retry: false,
    enabled: isHypershiftCluster,
  });

  return {
    isLoading,
    data: {
      ...data,
      data: data?.data.items.map(normalizeNodePool),
    },
    isError,
    error,
    refetch,
    isRefetching,
  };
};

const useFetchMachinePools = (clusterID: string, isHypershiftCluster: boolean, region?: string) => {
  const isModalOpen = useIsModalOpen();
  const { isLoading, data, isError, error, refetch, isRefetching } = useQuery({
    queryKey: [
      queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
      'machinePools',
      'clusterService',
      clusterID,
      isHypershiftCluster,
      region,
    ],
    queryFn: async () => {
      if (region) {
        const clusterService = getClusterServiceForRegion(region);
        const response = await clusterService.getMachinePools(clusterID);
        return response;
      }

      const response = await clusterService.getMachinePools(clusterID);
      return response;
    },
    refetchOnWindowFocus: !isModalOpen,
    retry: false,
    enabled: !isHypershiftCluster,
  });

  return {
    isLoading,
    data,
    isError,
    error,
    refetch,
    isRefetching,
  };
};

export const useFetchMachineOrNodePools = (
  clusterID: string,
  isHypershiftCluster: boolean,
  clusterVersion: any,
  region?: string,
  clusterRawVersion?: string,
) => {
  const {
    isLoading: isNodepoolWithUpgradePoliciesLoading,
    data: nodepoolWithUpgradePoliciesData,
    isError: isNodePoolWithUpgradePoliciesError,
    error: nodePoolWithUpgradePoliciesError,
    refetch: refetchNodePoolWithUpgradePolicies,
    isRefetching: isNodePoolWithUpgradePoliciesRefetching,
  } = useFetchNodePoolWithUpgradePolicies(
    clusterID,
    clusterVersion,
    isHypershiftCluster,
    region,
    clusterRawVersion || '',
  );

  const {
    isLoading: isMachinePoolsLoading,
    data: machinePoolsData,
    isError: isMachinePoolsError,
    error: machinePoolsError,
    refetch: refetchMachinePools,
    isRefetching: isMachinePoolsRefetching,
  } = useFetchMachinePools(clusterID, isHypershiftCluster, region);

  const formattedNodePoolError = formatErrorData(
    isNodepoolWithUpgradePoliciesLoading,
    isNodePoolWithUpgradePoliciesError,
    nodePoolWithUpgradePoliciesError,
  );
  const formattedMachinePoolError = formatErrorData(
    isMachinePoolsLoading,
    isMachinePoolsError,
    machinePoolsError,
  );

  if (isHypershiftCluster) {
    return {
      isLoading: isNodepoolWithUpgradePoliciesLoading,
      data: nodepoolWithUpgradePoliciesData?.data,
      isError: isNodePoolWithUpgradePoliciesError,
      error: formattedNodePoolError,
      refetch: refetchNodePoolWithUpgradePolicies,
      isRefetching: isNodePoolWithUpgradePoliciesRefetching,
    };
  }

  return {
    isLoading: isMachinePoolsLoading,
    data: machinePoolsData?.data?.items,
    isError: isMachinePoolsError,
    error: formattedMachinePoolError,
    refetch: refetchMachinePools,
    isRefetching: isMachinePoolsRefetching,
  };
};

export const refetchMachineOrNodePoolsQuery = (
  clusterID: string,
  isHypershiftCluster: boolean,
  clusterVersion?: string,
  region?: string,
) => {
  if (isHypershiftCluster) {
    queryClient.invalidateQueries({
      queryKey: [
        'nodePoolWithUpgradePolicies',
        'clusterService',
        clusterID,
        clusterVersion,
        region,
      ],
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: ['machinePools', 'clusterService', clusterID, isHypershiftCluster, region],
    });
  }
};
