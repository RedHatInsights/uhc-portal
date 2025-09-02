import { defaultClusterFromSubscription } from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import * as clusterService from '~/services/clusterService';
import { renderHook, waitFor } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import { useAWSVPCFromCluster } from './useAWSVPCFromCluster';
import * as useAWSVPCFromClusterModule from './useAWSVPCFromCluster';

const mockGetClusterServiceForRegion = jest.spyOn(clusterService, 'getClusterServiceForRegion');
const mockedGetLogs = jest.fn();
const mockedGetAWSVPCDetails = jest.spyOn(useAWSVPCFromClusterModule, 'adaptVPCDetails');
const mockedfetchVpcByClusterId = jest.spyOn(useAWSVPCFromClusterModule, 'fetchVpcByClusterId');
const mockedfetchVpcByStsCredentials = jest.spyOn(
  useAWSVPCFromClusterModule,
  'fetchVpcByStsCredentials',
);

const cluster: ClusterFromSubscription = {
  ...defaultClusterFromSubscription,
  id: 'myClusterId',
  name: 'myClusterName',
  region: { id: 'myRegionId' },
  aws: {
    // vpc_id: 'myVpcId',
    subnet_ids: ['mySubnetId'],
    sts: { role_arn: 'myRoleArn' },
  },
};

const dataForVPC = {
  name: 'test1-vpc',
  red_hat_managed: false,
  id: 'vpc-0b955c67217a2e015',
  cidr_block: '10.0.0.0/16',
  aws_subnets: [
    {
      subnet_id: 'subnet-5678',
      name: 'test1-subnet-public2',
      red_hat_managed: false,
      public: true,
      availability_zone: 'us-west-2b',
      cidr_block: '10.0.16.0/20',
    },
    {
      subnet_id: 'subnet-1234',
      name: 'test1-subnet-private1',
      red_hat_managed: false,
      public: false,
      availability_zone: 'us-west-2a',
      cidr_block: '10.0.128.0/20',
    },
  ],
  aws_security_groups: [
    {
      id: 'sg-1234',
      name: 'test-rosa-12b-99nqc-controlplane',
      red_hat_managed: true,
    },
    {
      id: 'sg-234',
      name: 'mock-vpce-private-router',
      red_hat_managed: true,
    },
    {
      id: 'sg-0e4ae8c53af6aaf24',
      name: 'mock-default-sg',
      red_hat_managed: true,
    },
    { id: 'sg-08dd62b720762cc76', name: 'mock-node', red_hat_managed: true },
    { id: 'sg-0228fd637d0124692', name: 'mock-securitygroup', red_hat_managed: false },
    {
      id: 'sg-04da4a9ac5b67b1be',
      name: 'mock-apiserver-lb',
      red_hat_managed: true,
    },
    { id: 'sg-0d4650d9dc9d50653', name: 'mock-5-securitygroup', red_hat_managed: false },
    { id: 'sg-042e7412792b7c0fc', name: 'mock-3-securitygroup', red_hat_managed: false },
    { id: 'sg-023d0f03c35ea0208', name: 'mock-lb', red_hat_managed: true },
    { id: 'sg-0506bfd7fd448f7e5', name: 'mock-4-securitygroup', red_hat_managed: false },
    { id: 'sg-05c71cfd5bd36e14d', name: 'mock-2-securitygroup', red_hat_managed: false },
  ],
};

describe('useAWSVPCFromCluster', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('returns VPC details for non HCP cluster', async () => {
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({ getLogs: mockedGetLogs });
    mockedfetchVpcByStsCredentials.mockReturnValue(Promise.resolve(dataForVPC));
    mockedfetchVpcByClusterId.mockReturnValue(Promise.resolve(dataForVPC));
    mockedGetAWSVPCDetails.mockReturnValue(dataForVPC);

    const { result } = renderHook(() => useAWSVPCFromCluster(cluster, 'myRegion'));
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    const { clusterVpc, hasError, refreshVPC } = result.current;
    expect(clusterVpc.name).toEqual(dataForVPC.name);
    expect(hasError).toBeFalsy();
    expect(refreshVPC).toBeInstanceOf(Function);
  });

  it('returns VPC details for HCP cluster', async () => {
    // @ts-ignore
    mockGetClusterServiceForRegion.mockReturnValue({ getLogs: mockedGetLogs });
    mockedfetchVpcByStsCredentials.mockReturnValue(Promise.resolve(dataForVPC));
    mockedfetchVpcByClusterId.mockReturnValue(Promise.resolve(dataForVPC));
    mockedGetAWSVPCDetails.mockReturnValue(dataForVPC);
    const hcpCluster = {
      ...cluster,
      hypershift: {
        enabled: true,
      },
    };
    const { result } = renderHook(() => useAWSVPCFromCluster(hcpCluster, 'myRegion'));
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    const { clusterVpc, hasError, refreshVPC } = result.current;
    expect(clusterVpc.name).toEqual(dataForVPC.name);
    expect(hasError).toBeFalsy();
    expect(refreshVPC).toBeInstanceOf(Function);
  });
});
