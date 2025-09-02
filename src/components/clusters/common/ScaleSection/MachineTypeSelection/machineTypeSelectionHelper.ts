import { humanizeValueWithUnit, Unit } from '~/common/units';
import { MachineTypesByRegionState } from '~/redux/reducers/machineTypesByRegionReducer';
import { MachineType } from '~/types/clusters_mgmt.v1';

import { machineCategories } from './sortMachineTypes';

const isMachineTypeIncludedInFilteredSet = (
  machineTypeID: string | undefined,
  filteredMachineTypes: MachineTypesByRegionState,
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
  if (!machineType || !machineType.memory?.value || !machineType.memory?.unit) {
    return '';
  }
  const humanizedMemory = humanizeValueWithUnit(
    machineType.memory?.value,
    machineType.memory?.unit as Unit,
  );
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

export {
  groupedMachineTypes,
  isMachineTypeIncludedInFilteredSet,
  machineTypeDescriptionLabel,
  machineTypeFullLabel,
  machineTypeLabel,
};
