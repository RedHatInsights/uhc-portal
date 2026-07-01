import { keyBy } from 'lodash';

import { MachineType } from '~/types/clusters_mgmt.v1';

// Group machine types by cloud provider
export const groupByCloudProvider = (
  machineTypes?: MachineType[],
): { [id: string]: MachineType[] } => {
  const byProvider: { [id: string]: MachineType[] } = {};
  machineTypes?.forEach((machineType) => {
    const providerID = machineType.cloud_provider?.id;
    if (providerID) {
      if (!byProvider[providerID]) {
        byProvider[providerID] = [machineType];
      } else {
        byProvider[providerID].push(machineType);
      }
    }
  });
  return byProvider;
};

const typesByIdAwsGcp = (types: { [id: string]: MachineType[] }) =>
  keyBy([...(types.aws ?? []), ...(types.gcp ?? [])], 'id');

/** {@link MachineTypesResponse} with required `types` and `typesByID` (what {@link mapMachineTypesItemsToResponse} always returns). */
export type MachineTypesItemsMapped = {
  types: { [id: string]: MachineType[] };
  typesByID: { [id: string]: MachineType };
};

/**
 * Maps API `items` into {@link MachineTypesResponse} (grouped by cloud + keyed IDs for aws/gcp).
 * Same shape as `machineTypesByRegionReducer` fulfilled payload.
 */
export const mapMachineTypesItemsToResponse = (items?: MachineType[]): MachineTypesItemsMapped => {
  const types = groupByCloudProvider(items);
  return { types, typesByID: typesByIdAwsGcp(types) };
};
