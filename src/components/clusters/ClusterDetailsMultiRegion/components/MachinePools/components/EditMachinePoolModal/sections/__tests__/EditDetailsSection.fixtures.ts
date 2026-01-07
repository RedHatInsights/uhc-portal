import { MachineType, NodePool } from '~/types/clusters_mgmt.v1';
import { ImageType } from '~/types/clusters_mgmt.v1/enums';
import { ClusterFromSubscription } from '~/types/types';

const mockMachineType: MachineType = {
  kind: 'MachineType',
  id: 'm5.xlarge',
  href: '/api/clusters_mgmt/v1/machine_types/m5.xlarge',
  name: 'm5.xlarge - General Purpose',
  category: 'general_purpose',
  size: 'small',
  memory: { value: 17179869184, unit: 'B' },
  cpu: { value: 4, unit: 'vCPU' },
  cloud_provider: {
    kind: 'CloudProviderLink',
    id: 'aws',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws',
  },
  ccs_only: false,
  generic_name: 'standard-4',
};

// Generated-by: Cursor/gemini-2.5-pro
const mockCluster: ClusterFromSubscription = {
  id: 'test-cluster',
  name: 'Test Cluster',
  product: { id: 'rosa' },
  hypershift: { enabled: false },
  cloud_provider: { id: 'aws' },
  region: { id: 'us-east-1' },
  version: { raw_id: '4.14.0' },
  multi_az: true,
  ccs: { enabled: false },
  metrics: {
    arch: 'amd64',
    cloud_provider: 'aws',
    cluster_type: 'osd',
    console_url: 'https://console.test-cluster.example.com',
    openshift_version: '4.14.0',
    operating_system: 'RHCOS',
    region: 'us-east-1',
    state: 'ready',
    state_description: 'Cluster is ready',
    compute_nodes_cpu: {
      total: { unit: 'vCPU', value: 16 },
      updated_timestamp: '2023-01-01T00:00:00Z',
      used: { unit: 'vCPU', value: 4 },
    },
    compute_nodes_memory: {
      total: { unit: 'GiB', value: 64 },
      updated_timestamp: '2023-01-01T00:00:00Z',
      used: { unit: 'GiB', value: 16 },
    },
    compute_nodes_sockets: {
      total: { unit: 'sockets', value: 8 },
      updated_timestamp: '2023-01-01T00:00:00Z',
      used: { unit: 'sockets', value: 2 },
    },
    cpu: {
      total: { unit: 'vCPU', value: 16 },
      updated_timestamp: '2023-01-01T00:00:00Z',
      used: { unit: 'vCPU', value: 4 },
    },
    memory: {
      total: { unit: 'GiB', value: 64 },
      updated_timestamp: '2023-01-01T00:00:00Z',
      used: { unit: 'GiB', value: 16 },
    },
    sockets: {
      total: { unit: 'sockets', value: 8 },
      updated_timestamp: '2023-01-01T00:00:00Z',
      used: { unit: 'sockets', value: 2 },
    },
    storage: {
      total: { unit: 'GiB', value: 1000 },
      updated_timestamp: '2023-01-01T00:00:00Z',
      used: { unit: 'GiB', value: 100 },
    },
    nodes: {
      compute: 3,
      infra: 2,
      master: 3,
      total: 8,
    },
    upgrade: {
      available: false,
      state: 'completed',
      updated_timestamp: '2023-01-01T00:00:00Z',
    },
    critical_alerts_firing: 0,
    operators_condition_failing: 0,
    non_virt_nodes: 8,
    subscription_cpu_total: 100,
    subscription_obligation_exists: 1,
    subscription_socket_total: 50,
  },
};

const mockHypershiftCluster: ClusterFromSubscription = {
  ...mockCluster,
  hypershift: { enabled: true },
};

const mockMachinePools: NodePool[] = [
  {
    kind: 'NodePool',
    id: 'workers-1',
    href: '/api/clusters_mgmt/v1/clusters/test/machine_pools/workers-1',
    aws_node_pool: {
      instance_type: 'm5.xlarge',
    },
    replicas: 3,
  },
  {
    kind: 'NodePool',
    id: 'windows-li-enabled-machine-pool',
    href: '/api/clusters_mgmt/v1/clusters/test/machine_pools/windows-li-enabled-machine-pool',
    aws_node_pool: {
      instance_type: 'm5.2xlarge',
    },
    replicas: 2,
    image_type: ImageType.Windows,
  },
];

const mockMachineTypesResponse = {
  types: {
    aws: [mockMachineType],
  },
  typesByID: {
    'm5.xlarge': mockMachineType,
  },
};

const editDetailsSectionDefaultProps = {
  cluster: mockCluster,
  isEdit: false,
  machinePools: mockMachinePools,
  currentMPId: mockMachinePools[0].id,
  setCurrentMPId: jest.fn(),
  machineTypesResponse: mockMachineTypesResponse,
  machineTypesLoading: false,
  region: 'us-east-1',
};

export {
  mockMachineType,
  mockCluster,
  mockHypershiftCluster,
  mockMachinePools,
  mockMachineTypesResponse,
  editDetailsSectionDefaultProps,
};
