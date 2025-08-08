import { IMDSType } from '~/components/clusters/wizards/common';
import { GlobalState } from '~/redux/store';
import type { OneMetric, Subscription } from '~/types/accounts_mgmt.v1';
import type { MachinePool, NodePool } from '~/types/clusters_mgmt.v1';
import type { ClusterFromSubscription } from '~/types/types';

export const defaultMetric: Readonly<OneMetric> = {
  cloud_provider: '',
  cluster_type: '',
  compute_nodes_cpu: {
    total: {
      unit: '',
      value: 0,
    },
    updated_timestamp: '',
    used: {
      unit: '',
      value: 0,
    },
  },
  compute_nodes_memory: {
    total: {
      unit: '',
      value: 0,
    },
    updated_timestamp: '',
    used: {
      unit: '',
      value: 0,
    },
  },
  compute_nodes_sockets: {
    total: {
      unit: '',
      value: 0,
    },
    updated_timestamp: '',
    used: {
      unit: '',
      value: 0,
    },
  },
  console_url: '',
  cpu: {
    total: {
      unit: '',
      value: 0,
    },
    updated_timestamp: '',
    used: {
      unit: '',
      value: 0,
    },
  },
  critical_alerts_firing: 0,
  memory: {
    total: {
      unit: '',
      value: 0,
    },
    updated_timestamp: '',
    used: {
      unit: '',
      value: 0,
    },
  },
  nodes: {
    compute: undefined,
    infra: undefined,
    master: undefined,
    total: undefined,
  },
  non_virt_nodes: 0,
  openshift_version: '',
  operating_system: '',
  operators_condition_failing: 0,
  region: '',
  sockets: {
    total: {
      unit: '',
      value: 0,
    },
    updated_timestamp: '',
    used: {
      unit: '',
      value: 0,
    },
  },
  state: '',
  state_description: '',
  storage: {
    total: {
      unit: '',
      value: 0,
    },
    updated_timestamp: '',
    used: {
      unit: '',
      value: 0,
    },
  },
  subscription_cpu_total: 0,
  subscription_obligation_exists: 0,
  subscription_socket_total: 0,
  upgrade: {
    available: undefined,
    state: undefined,
    updated_timestamp: undefined,
    version: undefined,
  },
};

export const defaultSubscription: Readonly<Subscription> = {
  managed: false,
};

export const defaultCluster: Readonly<ClusterFromSubscription> = {
  subscription: { ...defaultSubscription },
  metrics: defaultMetric,
};

export const defaultGCPCluster: Readonly<ClusterFromSubscription> = {
  subscription: { ...defaultSubscription },
  metrics: defaultMetric,
  cloud_provider: {
    id: 'gcp',
  },
  gcp: {
    security: {
      secure_boot: true,
    },
  },
};

export const defaultMachinePool: Readonly<MachinePool | NodePool> = {};

export const hyperShiftCluster: Readonly<ClusterFromSubscription> = {
  ...defaultCluster,
  hypershift: { enabled: true },
};

export const defaultMachineTypes: GlobalState['machineTypes'] = {
  error: false,
  pending: false,
  fulfilled: true,
  types: {},
  typesByID: {},
};

export const defaultMachinePools: (MachinePool | NodePool)[] = [];

export const defaultExpectedInitialValues = {
  auto_repair: true,
  autoscaleMax: 1,
  autoscaleMin: 0,
  autoscaling: false,
  diskSize: 300,
  instanceType: undefined,
  imds: IMDSType.V1AndV2,
  labels: [
    {
      key: '',
      value: '',
      isAwsTag: false,
    },
  ],
  maxPrice: 0.01,
  name: '',
  privateSubnetId: undefined,
  replicas: 0,
  securityGroupIds: [],
  spotInstanceType: 'onDemand',
  taints: [
    {
      effect: 'NoSchedule',
      key: '',
      value: '',
    },
  ],
  useSpotInstances: false,
};

export const hyperShiftExpectedInitialValues = {
  ...defaultExpectedInitialValues,
  autoscaleMax: 2,
  autoscaleMin: 2,
  replicas: 2,
};

export const gcpSecureBootExpectedInitialValues = {
  ...defaultExpectedInitialValues,
  secure_boot: true,
};
