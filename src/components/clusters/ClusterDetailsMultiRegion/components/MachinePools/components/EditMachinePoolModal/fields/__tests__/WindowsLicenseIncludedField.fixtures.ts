import { ImageType } from '~/types/clusters_mgmt.v1/enums';

const defaultMachinePool = {
  id: 'fooId',
  availability_zones: ['us-east-1a'],
  href: '/api/clusters_mgmt/v1/clusters/282fg0gt74jjb9558ge1poe8m4dlvb07/machine_pools/some-user-mp',
  instance_type: 'm5.xlarge',
  kind: 'NodePool',
  replicas: 21,
  root_volume: { aws: { size: 300 } },
};

const WindowsLIEnabledMachinePool = {
  ...defaultMachinePool,
  image_type: ImageType.Windows,
};

const WindowsLIDisabledMachinePool = {
  ...defaultMachinePool,
  image_type: undefined,
};

const defaultMachineType = {
  kind: 'MachineType',
  name: 'c5.2xlarge - Compute Optimized',
  category: 'compute_optimized',
  size: 'medium',
  id: 'c5.2xlarge',
  href: '/api/clusters_mgmt/v1/machine_types/c5.2xlarge',
  memory: {
    value: 17179869184,
    unit: 'B',
  },
  cpu: {
    value: 8,
    unit: 'vCPU',
  },
  cloud_provider: {
    kind: 'CloudProviderLink',
    id: 'aws',
    href: '/api/clusters_mgmt/v1/cloud_providers/aws',
  },
  ccs_only: false,
  generic_name: 'highcpu-8',
};

const WindowsLIEnabledMachineType = {
  ...defaultMachineType,
  features: {
    win_li: true,
  },
};

const initialValues = {
  instanceType: defaultMachineType,
};

const initialValuesWithWindowsLIEnabledMachineTypeSelected = {
  instanceType: WindowsLIEnabledMachineType,
};

const initialValuesEmptyMachineType = {
  instanceType: undefined,
};

export {
  defaultMachinePool,
  WindowsLIEnabledMachinePool,
  WindowsLIDisabledMachinePool,
  defaultMachineType,
  WindowsLIEnabledMachineType,
  initialValues,
  initialValuesWithWindowsLIEnabledMachineTypeSelected,
  initialValuesEmptyMachineType,
};
