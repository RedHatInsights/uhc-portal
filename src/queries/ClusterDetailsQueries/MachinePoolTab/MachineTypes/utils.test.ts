import { MachineType } from '~/types/clusters_mgmt.v1';

import { groupByCloudProvider, mapMachineTypesItemsToResponse } from './utils';

describe('groupByCloudProvider', () => {
  it('should group machine types by cloud provider id', () => {
    const machineTypes: MachineType[] = [
      { id: 'm1', name: 'type1', cloud_provider: { id: 'aws', name: 'AWS' } } as MachineType,
      { id: 'm2', name: 'type2', cloud_provider: { id: 'gcp', name: 'GCP' } } as MachineType,
      { id: 'm3', name: 'type3', cloud_provider: { id: 'aws', name: 'AWS' } } as MachineType,
    ];
    const result = groupByCloudProvider(machineTypes);
    expect(result).toEqual({
      aws: [
        { id: 'm1', name: 'type1', cloud_provider: { id: 'aws', name: 'AWS' } },
        { id: 'm3', name: 'type3', cloud_provider: { id: 'aws', name: 'AWS' } },
      ],
      gcp: [{ id: 'm2', name: 'type2', cloud_provider: { id: 'gcp', name: 'GCP' } }],
    });
  });

  it('should return an empty object if input is undefined', () => {
    expect(groupByCloudProvider(undefined)).toEqual({});
  });

  it('should return an empty object if input is an empty array', () => {
    expect(groupByCloudProvider([])).toEqual({});
  });

  it('should skip machine types without a cloud provider id', () => {
    const machineTypes: MachineType[] = [
      { id: 'm1', name: 'type1', cloud_provider: { id: 'aws', name: 'AWS' } } as MachineType,
      { id: 'm2', name: 'type2', cloud_provider: undefined } as MachineType,
      {
        id: 'm3',
        name: 'type3',
        cloud_provider: { id: undefined, name: 'Unknown' },
      } as MachineType,
    ];
    const result = groupByCloudProvider(machineTypes);
    expect(result).toEqual({
      aws: [{ id: 'm1', name: 'type1', cloud_provider: { id: 'aws', name: 'AWS' } }],
    });
  });

  it('should handle multiple machine types with the same provider', () => {
    const machineTypes: MachineType[] = [
      { id: 'm1', name: 'type1', cloud_provider: { id: 'azure', name: 'Azure' } } as MachineType,
      { id: 'm2', name: 'type2', cloud_provider: { id: 'azure', name: 'Azure' } } as MachineType,
    ];
    const result = groupByCloudProvider(machineTypes);
    expect(result.azure.length).toBe(2);
  });
});

describe('mapMachineTypesItemsToResponse', () => {
  it('returns types and typesByID for aws and gcp only', () => {
    const items = [
      { id: 'a1', cloud_provider: { id: 'aws' } },
      { id: 'g1', cloud_provider: { id: 'gcp' } },
    ] satisfies MachineType[];
    const result = mapMachineTypesItemsToResponse(items);
    expect(result).toEqual({
      types: {
        aws: [items[0]],
        gcp: [items[1]],
      },
      typesByID: {
        a1: items[0],
        g1: items[1],
      },
    });
  });

  it('returns empty maps when items undefined', () => {
    expect(mapMachineTypesItemsToResponse(undefined)).toEqual({
      types: {},
      typesByID: {},
    });
  });
});
