import React from 'react';
import { AxiosError, AxiosResponse } from 'axios';

import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { CloudProviderVPCRequest } from '~/redux/actions/ccsInquiriesActions';
import { securityGroupsSort } from '~/redux/reducers/ccsInquiriesReducer';
import clusterService, { getClusterServiceForRegion } from '~/services/clusterService';
import { CloudVpc } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

// const { getAWSVPCDetails } = clusterService;

/**
 * Reads the response of VPCs associated to a given subnet.
 * A particular subnet should belong to a single VPC.
 * It shouldn't happen, but if the result contained more than 1 VPC, we wouldn't know which one the cluster uses.
 * @param vpcResponse
 */
const readVpcFromList = (
  vpcResponse: AxiosResponse<{
    items?: CloudVpc[] | undefined;
  }>,
): CloudVpc | undefined => {
  const vpcList = vpcResponse.data?.items || [];
  if (vpcList.length === 1) {
    return vpcList[0];
  }
  return undefined;
};

export const adaptVPCDetails = (vpc: CloudVpc) => {
  const securityGroups = (vpc.aws_security_groups || []).filter((sg) => !sg.red_hat_managed);
  securityGroups.sort(securityGroupsSort);
  return { ...vpc, aws_security_groups: securityGroups };
};

export const fetchVpcByClusterId = async (clusterId: string, region?: string) => {
  if (region) {
    const clusterService = getClusterServiceForRegion(region);
    let vpc;
    const result = await clusterService.getAWSVPCDetails(clusterId, {
      includeSecurityGroups: true,
    });
    if (result.data?.id) {
      vpc = result.data;
    }
    return vpc;
  }
  let vpc;
  const result = await clusterService.getAWSVPCDetails(clusterId, { includeSecurityGroups: true });
  if (result.data?.id) {
    vpc = result.data;
  }
  return vpc;
};

// TODO: needs multiregion
export const fetchVpcByStsCredentials = async (
  vpcRequestMemo: CloudProviderVPCRequest,
  dataSovereigntyRegion?: string,
) => {
  if (dataSovereigntyRegion) {
    const clusterService = getClusterServiceForRegion(dataSovereigntyRegion);
    const vpcList = await clusterService.listAWSVPCs(
      vpcRequestMemo.awsCredentials,
      vpcRequestMemo.region,
      vpcRequestMemo.subnet,
      vpcRequestMemo.options,
    );
    return readVpcFromList(vpcList);
  }
  const vpcList = await clusterService.listAWSVPCs(
    vpcRequestMemo.awsCredentials,
    vpcRequestMemo.region,
    vpcRequestMemo.subnet,
    vpcRequestMemo.options,
  );
  return readVpcFromList(vpcList);
};

/**
 * React hook for fetching the VPC of a BYO VPC cluster
 * - For Hypershift clusters, we cannot use the endpoint by clusterId.
 *  Security groups are not supported, so we don't include the option to retrieve them.
 * - For other BYO VPC clusters, we fetch the VPC by clusterId, including Security groups.
 * @param cluster the cluster to retrieve the VPC for
 * @returns vpc details.
 */
export const useAWSVPCFromCluster = (cluster: ClusterFromSubscription, region?: string) => {
  const [clusterVpc, setClusterVpc] = React.useState<CloudVpc | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(!!cluster.id);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [errorReason, setErrorReason] = React.useState<string>();
  const isHypershift = isHypershiftCluster(cluster);
  const clusterId = cluster.id || '';
  const subnetIds = cluster.aws?.subnet_ids || [];
  const isBYOVPC = subnetIds.length > 0;

  const manageVpcFetch = React.useCallback(async (vpcPromise: Promise<CloudVpc | undefined>) => {
    setHasError(false);
    setIsLoading(true);
    try {
      const vpc = await vpcPromise;
      if (vpc) {
        setClusterVpc(adaptVPCDetails(vpc));
      }
    } catch (err) {
      setHasError(true);
      setClusterVpc(undefined);
      const axiosErr = err as any as AxiosError;
      const axiosResponse = axiosErr.response as any as AxiosResponse;
      setErrorReason(axiosResponse.data.reason);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetches the VPC by the cluster's STS credentials
  // The dependencies are the primitive values - if we use an object the event will trigger even when no data has changed.
  const subnetId = subnetIds.length > 0 ? subnetIds[0] : undefined;
  const roleArn = cluster.aws?.sts?.role_arn;
  const regionId = cluster.region?.id || '';

  const fetchVPC = () => {
    const loadVpcByStsCredentials = async () => {
      const request = {
        awsCredentials: { sts: { role_arn: roleArn } },
        region: regionId,
        subnet: subnetId,
        options: { includeSecurityGroups: isHypershift },
      };
      return manageVpcFetch(fetchVpcByStsCredentials(request, region));
    };
    const loadVpcByClusterId = async () => manageVpcFetch(fetchVpcByClusterId(clusterId, region));

    if (isHypershift && roleArn && subnetId && regionId) {
      loadVpcByStsCredentials();
    }
    if (clusterId && !isHypershift && isBYOVPC) {
      loadVpcByClusterId();
    }
  };

  React.useEffect(fetchVPC, [
    isHypershift,
    subnetId,
    roleArn,
    regionId,
    region,
    manageVpcFetch,
    clusterId,
    isBYOVPC,
  ]);
  return { clusterVpc, isLoading, hasError, errorReason, refreshVPC: fetchVPC };
};
