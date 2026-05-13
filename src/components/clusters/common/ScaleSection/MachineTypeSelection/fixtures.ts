import { MachineTypesResponse } from '~/queries/types';
import { mapMachineTypesById } from '~/redux/reducers/machineTypesReducer';
import { MachineType } from '~/types/clusters_mgmt.v1';

const baseFlavoursState = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: true,
  byID: {
    // actually contains 'osd-4' key, but not supposed to peek at it until fulfilled
  },
};

const fulfilledFlavoursState = {
  ...baseFlavoursState,
  byID: {
    'osd-4': {
      aws: {
        compute_instance_type: 'm5.xlarge',
      },
      gcp: {
        compute_instance_type: 'custom-4-16384', // TODO not listed in machineTypes
      },
    },
  },
};

const pendingFlavoursState = {
  ...baseFlavoursState,
  pending: true,
  fulfilled: false,
};

const errorFlavoursState = {
  ...baseFlavoursState,
  error: true,
  errorMessage: 'Out of vanilla ice cream',
  fulfilled: false,
};

const emptyMachineTypesResponse = {
  types: {},
  typesByID: {},
};

const baseState = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: false,
  ...emptyMachineTypesResponse,
};

const pendingState = {
  ...baseState,
  pending: true,
  fulfilled: false,
};

const errorData = {
  error: true,
  errorMessage: 'This is an error message',
};

const errorState = {
  ...baseState,
  ...errorData,
};

const organizationState = {
  fulfilled: true,
  pending: false,
};

const machineTypes: MachineTypesResponse['types'] = {
  aws: [
    {
      kind: 'MachineType',
      name: 'm5.xlarge - General Purpose',
      category: 'general_purpose',
      size: 'small',
      id: 'm5.xlarge',
      href: '/api/clusters_mgmt/v1/machine_types/m5.xlarge',
      memory: {
        value: 17179869184,
        unit: 'B',
      },
      cpu: {
        value: 4,
        unit: 'vCPU',
      },
      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      ccs_only: false,
      generic_name: 'standard-4',
    },
    {
      kind: 'MachineType',
      name: 'm5.4xlarge - General Purpose',
      category: 'general_purpose',
      size: 'large',
      id: 'm5.4xlarge',
      href: '/api/clusters_mgmt/v1/machine_types/m5.4xlarge',
      memory: {
        value: 68719476736,
        unit: 'B',
      },
      cpu: {
        value: 16,
        unit: 'vCPU',
      },
      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      ccs_only: false,
      generic_name: 'standard-16',
    },
    {
      kind: 'MachineType',
      name: 'm5.12xlarge - General purpose',
      category: 'general_purpose',
      size: 'large',
      id: 'm5.12xlarge',
      href: '/api/clusters_mgmt/v1/machine_types/m5.12xlarge',
      memory: {
        value: 206158430208,
        unit: 'B',
      },
      cpu: {
        value: 48,
        unit: 'vCPU',
      },
      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      ccs_only: true,
      generic_name: 'standard-48',
    },
    {
      kind: 'MachineType',
      name: 'g4dn.2xlarge - Accelerated Computing (1 GPU)',
      category: 'accelerated_computing',
      size: 'medium',
      id: 'g4dn.2xlarge',
      href: '/api/clusters_mgmt/v1/machine_types/g4dn.2xlarge',
      memory: {
        value: 34359738368,
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
      ccs_only: true,
      generic_name: 't4-gpu-8',
    },
  ],
};

const machineTypesByRegion: MachineTypesResponse['types'] = {
  aws: [
    {
      kind: 'MachineType',
      name: 'm5.xlarge - General Purpose',
      category: 'general_purpose',
      size: 'small',
      id: 'm5.xlarge',
      href: '/api/clusters_mgmt/v1/machine_types/m5.xlarge',
      memory: {
        value: 17179869184,
        unit: 'B',
      },
      cpu: {
        value: 4,
        unit: 'vCPU',
      },
      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      ccs_only: false,
      generic_name: 'standard-4',
    },
    {
      kind: 'MachineType',
      name: 'm5.4xlarge - General Purpose',
      category: 'general_purpose',
      size: 'large',
      id: 'm5.4xlarge',
      href: '/api/clusters_mgmt/v1/machine_types/m5.4xlarge',
      memory: {
        value: 68719476736,
        unit: 'B',
      },
      cpu: {
        value: 16,
        unit: 'vCPU',
      },
      cloud_provider: {
        kind: 'CloudProviderLink',
        id: 'aws',
        href: '/api/clusters_mgmt/v1/cloud_providers/aws',
      },
      ccs_only: false,
      generic_name: 'standard-16',
    },
    {
      kind: 'MachineType',
      name: 'm6id.xlarge - Accelerated Computing (1 GPU)',
      category: 'accelerated_computing',
      size: 'medium',
      id: 'm6id.xlarge',
      href: '/api/clusters_mgmt/v1/machine_types/m6id.xlarge',
      memory: {
        value: 34359738368,
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
      ccs_only: true,
      generic_name: 't4-gpu-8',
    },
  ],
};

const machineTypesResponse = {
  types: machineTypes,
  typesByID: mapMachineTypesById(machineTypes),
};

const machineTypesByRegionResponse = {
  types: machineTypes,
  typesByID: mapMachineTypesById(machineTypesByRegion),
};

const fulfilledMachineByRegionState = {
  ...baseState,
  ...machineTypesByRegionResponse,
  fulfilled: true,
};

const unknownCategoryMachineTypes: MachineType[] = [
  {
    kind: 'MachineType',
    name: 'foo.2xbar - Quantum Computing (1 QPU)',
    // @ts-ignore
    category: 'foobar_computing',
    size: 'medium',
    id: 'foo.2xbar',
    href: '/api/clusters_mgmt/v1/machine_types/foo.2xbar',
    memory: {
      value: 34359738368,
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
    generic_name: 'standard-4', // reusing existing one for simplicity, need to have quota for it.
  },
  {
    kind: 'MachineType',
    name: 'foo.4xbar - Quantum Computing (2 QPU)',
    // @ts-ignore
    category: 'foobar_computing',
    size: 'medium',
    id: 'foo.4xbar',
    href: '/api/clusters_mgmt/v1/machine_types/foo.4xbar',
    memory: {
      value: 34359738368,
      unit: 'B',
    },
    cpu: {
      value: 16,
      unit: 'vCPU',
    },
    cloud_provider: {
      kind: 'CloudProviderLink',
      id: 'aws',
      href: '/api/clusters_mgmt/v1/cloud_providers/aws',
    },
    ccs_only: false,
    generic_name: 'standard-4', // reusing existing one for simplicity, need to have quota for it.
  },
];

export {
  baseFlavoursState,
  fulfilledFlavoursState,
  pendingFlavoursState,
  errorFlavoursState,
  baseState,
  pendingState,
  errorState,
  organizationState,
  errorData,
  emptyMachineTypesResponse,
  machineTypes,
  machineTypesByRegion,
  machineTypesResponse,
  machineTypesByRegionResponse,
  fulfilledMachineByRegionState,
  unknownCategoryMachineTypes,
};
