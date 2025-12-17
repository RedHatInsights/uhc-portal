/**
 * Unit test for MachineTypeSelection component
 *
 * This test focuses on verifying the fix for the issue where
 * machineTypesByRegion.typesByID could be undefined, causing
 * "undefined is not an object" errors.
 *
 * The fix added optional chaining (?.) before bracket notation
 * to safely navigate the typesByID property:
 * filteredMachineTypes?.typesByID?.[machineTypeID]
 */

import { isMachineTypeIncludedInFilteredSet } from './MachineTypeSelection';

describe('MachineTypeSelection - typesByID undefined handling', () => {
  describe('isMachineTypeIncludedInFilteredSet helper function', () => {
    const cases = [
      {
        name: 'typesByID is undefined',
        machineTypeID: 'm5.xlarge',
        filteredMachineTypes: {
          error: false,
          fulfilled: false,
          // typesByID is intentionally undefined
        },
        expected: false,
      },
      {
        name: 'typesByID is null',
        machineTypeID: 'm5.xlarge',
        filteredMachineTypes: {
          error: false,
          fulfilled: false,
          typesByID: null,
        },
        expected: false,
      },
      {
        name: 'filteredMachineTypes is undefined',
        machineTypeID: 'm5.xlarge',
        filteredMachineTypes: undefined,
        expected: false,
      },
      {
        name: 'filteredMachineTypes is null',
        machineTypeID: 'm5.xlarge',
        filteredMachineTypes: null,
        expected: false,
      },
      {
        name: 'machineTypeID not found in typesByID',
        machineTypeID: 'm5.xlarge',
        filteredMachineTypes: {
          error: false,
          fulfilled: true,
          typesByID: {
            'm5.2xlarge': { id: 'm5.2xlarge', name: 'm5.2xlarge' },
          },
        },
        expected: false,
      },
      {
        name: 'machineTypeID exists in typesByID',
        machineTypeID: 'm5.xlarge',
        filteredMachineTypes: {
          error: false,
          fulfilled: true,
          typesByID: {
            'm5.xlarge': { id: 'm5.xlarge', name: 'm5.xlarge - General Purpose' },
            'm5.2xlarge': { id: 'm5.2xlarge', name: 'm5.2xlarge' },
          },
        },
        expected: true,
      },
      {
        name: 'empty typesByID object',
        machineTypeID: 'm5.xlarge',
        filteredMachineTypes: {
          error: false,
          fulfilled: true,
          typesByID: {},
        },
        expected: false,
      },
    ];

    it.each(cases)(
      'should return $expected when $name',
      ({ machineTypeID, filteredMachineTypes, expected }) => {
        // Act
        const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

        // Assert
        expect(result).toBe(expected);
      },
    );
  });
});
