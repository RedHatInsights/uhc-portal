import type { Flavour, MachineType } from '~/types/clusters_mgmt.v1';

import {
  defaultComputeInstanceTypeFromFlavour,
  groupedMachineTypes,
  isMachineTypeIncludedInFilteredSet,
  machineTypeDescriptionLabel,
  machineTypeFullLabel,
  machineTypeLabel,
} from './machineTypeSelectionHelper';
import { machineCategories } from './sortMachineTypes';

function categoryForGroupedTest(name: string): MachineType['category'] {
  const allowed = new Set(machineCategories.map((c) => c.name));
  if (!allowed.has(name)) {
    throw new Error(`Unexpected category name: ${name}`);
  }
  return name as MachineType['category'];
}

describe('machineTypeSelectionHelper', () => {
  describe('isMachineTypeIncludedInFilteredSet', () => {
    it('should return true for a Machine Type which exists on the list', () => {
      // Arrange
      const machineTypeID = '1';
      const machineTypes = {
        typesByID: { '1': { id: '1' } satisfies MachineType },
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, machineTypes);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for a Machine Type which does not exist on the list', () => {
      // Arrange
      const machineTypeID = '0';
      const machineTypes = {
        typesByID: { '1': { id: '1' } satisfies MachineType },
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, machineTypes);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false in case of a missing MachineTypeID', () => {
      // Arrange
      const machineTypeID = undefined;
      const machineTypes = {
        typesByID: { '1': { id: '1' } satisfies MachineType },
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, machineTypes);

      // Assert
      expect(result).toBe(false);
    });
  });

  /** Returns a map kind of object containing the lists of MachineTypes filtered by their MachineTypeCategory */
  describe('groupedMachineTypes', () => {
    it('returns the Machine Types grouped by categories according to the given Machine Types', () => {
      // Arrange
      const machineTypes: MachineType[] = machineCategories.map((e, index) => ({
        id: `${index}`,
        category: categoryForGroupedTest(e.name),
      }));

      // Act
      const result = groupedMachineTypes(machineTypes);

      // Assert
      expect(result).toStrictEqual({
        'General purpose': [{ id: '0', category: 'general_purpose' }],
        'Memory optimized': [{ id: '1', category: 'memory_optimized' }],
        'Compute optimized': [{ id: '2', category: 'compute_optimized' }],
        'Storage optimized': [{ id: '3', category: 'storage_optimized' }],
        'Network optimized': [{ id: '4', category: 'network_optimized' }],
        Burstable: [{ id: '5', category: 'burstable' }],
        'Accelerated computing': [{ id: '6', category: 'accelerated_computing' }],
      });
    });

    it('returns every category label with empty lists when there are no machines', () => {
      const result = groupedMachineTypes([]);
      expect(result['General purpose']).toStrictEqual([]);
      expect(result['Accelerated computing']).toStrictEqual([]);
    });

    it('places machines only under their category label', () => {
      const machines = [
        { id: 'a', category: categoryForGroupedTest('burstable') },
        { id: 'b', category: categoryForGroupedTest('burstable') },
      ] satisfies MachineType[];
      const result = groupedMachineTypes(machines);
      expect(result.Burstable).toStrictEqual(machines);
      expect(result['General purpose']).toStrictEqual([]);
    });
  });

  describe('defaultComputeInstanceTypeFromFlavour', () => {
    it('returns AWS compute instance type when cloud is aws', () => {
      const flavour = {
        aws: { compute_instance_type: 'm5.xlarge' },
      } satisfies Flavour;
      expect(defaultComputeInstanceTypeFromFlavour(flavour, 'aws')).toBe('m5.xlarge');
    });

    it('returns GCP compute instance type when cloud is gcp', () => {
      const flavour = {
        gcp: { compute_instance_type: 'n1-standard-4' },
      } satisfies Flavour;
      expect(defaultComputeInstanceTypeFromFlavour(flavour, 'gcp')).toBe('n1-standard-4');
    });

    it('returns undefined when flavour or cloud is missing', () => {
      expect(defaultComputeInstanceTypeFromFlavour(undefined, 'aws')).toBeUndefined();
      expect(
        defaultComputeInstanceTypeFromFlavour(
          { aws: { compute_instance_type: 'm5.xlarge' } },
          undefined,
        ),
      ).toBeUndefined();
      expect(
        defaultComputeInstanceTypeFromFlavour(
          { aws: { compute_instance_type: 'm5.xlarge' } },
          'gcp',
        ),
      ).toBeUndefined();
    });
  });

  describe('machineTypeDescriptionLabel', () => {
    it('returns the corresponding description label of the MachineType according to the MachineType provided', () => {
      // Arrange
      const machineType = {
        cpu: {
          value: 4,
          unit: 'vCPU',
        },
        memory: {
          value: 8589934592,
          unit: 'B',
        },
      } satisfies MachineType;

      // Act
      const result = machineTypeDescriptionLabel(machineType);

      // Assert
      expect(result).toStrictEqual('4 vCPU 8 GiB RAM');
    });

    it('MachineType category is `accelerated_computing`', () => {
      // Arrange
      const machineType = {
        cpu: {
          value: 4,
          unit: 'vCPU',
        },
        memory: {
          value: 8589934592,
          unit: 'B',
        },
        category: 'accelerated_computing',
        name: 'g4ad.2xlarge - Accelerated Computing',
      } satisfies MachineType;

      // Act
      const result = machineTypeDescriptionLabel(machineType);

      // Assert
      expect(result).toStrictEqual('4 vCPU 8 GiB RAM');
    });

    it('MachineType category is `accelerated_computing` & has GPU', () => {
      // Arrange
      const machineType = {
        cpu: {
          value: 4,
          unit: 'vCPU',
        },
        memory: {
          value: 8589934592,
          unit: 'B',
        },
        category: 'accelerated_computing',
        name: 'g4dn.2xlarge - Accelerated Computing (1 GPU)',
      } satisfies MachineType;

      // Act
      const result = machineTypeDescriptionLabel(machineType);

      // Assert
      expect(result).toStrictEqual('4 vCPU 8 GiB RAM (1 GPU)');
    });

    it('should output an empty label for an empty Machine Type', () => {
      // Arrange
      const machineType = {} satisfies MachineType;

      // Act
      const result = machineTypeDescriptionLabel(machineType);

      // Assert
      expect(result).toBe('');
    });

    it('should output an empty label for a MachineType missing a `value` in the `memory` property', () => {
      // Arrange
      const machineType = {
        memory: {
          unit: 'B',
        },
      } satisfies MachineType;

      // Act
      const result = machineTypeDescriptionLabel(machineType);

      // Assert
      expect(result).toBe('');
    });

    it('should output an empty label for a Machine Type missing a `unit` in the `memory` property', () => {
      // Arrange
      const machineType = {
        memory: {
          value: 8589934592,
        },
      } satisfies MachineType;

      // Act
      const result = machineTypeDescriptionLabel(machineType);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('machineTypeLabel', () => {
    it('returns exact id used by cloud provider', () => {
      // Arrange
      const machineType = {
        id: '1',
      } satisfies MachineType;

      // Act
      const result = machineTypeLabel(machineType);

      // Assert
      expect(result).toBe('1');
    });

    it('returns an empty string in case an id is missing inside the MachineType', () => {
      // Arrange
      const machineType = {} satisfies MachineType;

      // Act
      const result = machineTypeLabel(machineType);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('machineTypeFullLabel', () => {
    it('returns useful info plus exact id used by the cloud provider', () => {
      // Arrange
      const machineType = {
        id: '1',
        cpu: {
          value: 4,
          unit: 'vCPU',
        },
        memory: {
          value: 8589934592,
          unit: 'B',
        },
      } satisfies MachineType;

      // Act
      const result = machineTypeFullLabel(machineType);

      // Assert
      expect(result).toBe('1 - 4 vCPU 8 GiB RAM');
    });

    it('returns an "empty" string in case a MachineType is not defined', () => {
      // Arrange
      const machineType = {} satisfies MachineType;

      // Act
      const result = machineTypeFullLabel(machineType);

      // Assert
      expect(result).toBe(' - ');
    });
  });
});
