import { normalizedProducts } from '~/common/subscriptionTypes';
import { humanizeValueWithUnit, type Unit } from '~/common/units';
import { CloudProviderType } from '~/components/clusters/wizards/common';
import type { CloudProvider, Flavour, MachineType } from '~/types/clusters_mgmt.v1';

import { machineCategories } from './sortMachineTypes';

type MachineTypesById = { typesByID?: { [id: string]: MachineType } };

const memoryUnitFromApi = (unit: string | undefined): Unit | undefined => {
  switch (unit) {
    case 'B':
    case 'KiB':
    case 'MiB':
    case 'GiB':
    case 'TiB':
    case 'PiB':
    case 'KB':
    case 'MB':
    case 'GB':
    case 'TB':
    case 'PB':
      return unit;
    default:
      return undefined;
  }
};

const isMachineTypeIncludedInFilteredSet = (
  machineTypeID: string | undefined,
  filteredMachineTypes: MachineTypesById,
) => !!machineTypeID && !!filteredMachineTypes?.typesByID?.[machineTypeID];

const groupedMachineTypes = (machines: MachineType[]): { [index: string]: MachineType[] } =>
  machineCategories.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.label]: machines.filter((machine) => machine.category === curr.name),
    }),
    {},
  );

/** Returns useful info about the machine type - CPUs, RAM, [GPUs]. */
const machineTypeDescriptionLabel = (machineType: MachineType): string => {
  if (!machineType?.memory?.value) {
    return '';
  }
  const memoryUnit = memoryUnitFromApi(machineType.memory.unit);
  if (!memoryUnit) {
    return '';
  }
  const humanizedMemory = humanizeValueWithUnit(machineType.memory.value, memoryUnit);
  let label = `${machineType.cpu?.value} ${machineType.cpu?.unit} ${humanizedMemory.value} ${humanizedMemory.unit} RAM`;
  if (machineType.category === 'accelerated_computing') {
    const numGPUsStr = machineType.name?.match(/\d+ GPU[s]?/g);
    if (numGPUsStr) {
      label += ` (${numGPUsStr})`;
    }
  }
  return label;
};

/** Returns exact id used by cloud provider. */
const machineTypeLabel = (machineType: MachineType): string => machineType?.id ?? '';

/** Returns useful info plus exact id used by the cloud provider. */
const machineTypeFullLabel = (machineType: MachineType) =>
  machineType
    ? `${machineTypeLabel(machineType)} - ${machineTypeDescriptionLabel(machineType)}`
    : '';

/** Default compute instance type from a fetched flavour for the active cloud provider. */
const defaultComputeInstanceTypeFromFlavour = (
  flavour: Flavour | undefined,
  cloudProviderID: CloudProvider['id'] | undefined,
): string | undefined => {
  if (!flavour || !cloudProviderID) {
    return undefined;
  }
  if (cloudProviderID === 'aws') {
    return flavour.aws?.compute_instance_type;
  }
  if (cloudProviderID === 'gcp') {
    return flavour.gcp?.compute_instance_type;
  }
  return undefined;
};

const shouldUseRegionFilteredData = (
  productId: string,
  cloudProviderID: CloudProvider['id'],
  isBYOC?: boolean,
  inModal?: boolean,
) =>
  (isBYOC || productId === normalizedProducts.ROSA) &&
  cloudProviderID === CloudProviderType.Aws &&
  !inModal;

export {
  defaultComputeInstanceTypeFromFlavour,
  groupedMachineTypes,
  isMachineTypeIncludedInFilteredSet,
  machineTypeDescriptionLabel,
  machineTypeFullLabel,
  machineTypeLabel,
  shouldUseRegionFilteredData,
};
