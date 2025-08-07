import { fieldId as instanceTypeFieldId } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';

const defaultMachinePool = {
  id: 'fooId',
  availability_zones: ['us-east-1a'],
  href: '/api/clusters_mgmt/v1/clusters/282fg0gt74jjb9558ge1poe8m4dlvb07/machine_pools/daznauro-mp',
  instance_type: 'm5.xlarge',
  kind: 'MachinePool',
  replicas: 21,
  root_volume: { aws: { size: 300 } },
};

const WindowsLIEnabledMachinePool = {
  ...defaultMachinePool,
  imageType: 'Windows',
};

const WindowsLIDisabledMachinePool = {
  ...defaultMachinePool,
  imageType: undefined,
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
    winLi: true,
  },
};

const initialValues = {
  [instanceTypeFieldId]: defaultMachineType,
};

const initialValuesWithWindowsLIEnabledMachineTypeSelected = {
  [instanceTypeFieldId]: WindowsLIEnabledMachineType,
};

const initialValuesEmptyMachineType = {
  [instanceTypeFieldId]: undefined,
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
