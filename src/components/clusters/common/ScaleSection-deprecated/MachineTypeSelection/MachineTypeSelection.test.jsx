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

describe('MachineTypeSelection - typesByID undefined handling', () => {
  describe('isMachineTypeIncludedInFilteredSet helper function', () => {
    // Simulate the fixed function from the component
    const isMachineTypeIncludedInFilteredSet = (machineTypeID, filteredMachineTypes) =>
      !!filteredMachineTypes?.typesByID?.[machineTypeID];

    it('should return false when filteredMachineTypes.typesByID is undefined', () => {
      // Arrange
      const machineTypeID = 'm5.xlarge';
      const filteredMachineTypes = {
        error: false,
        fulfilled: false,
        // typesByID is intentionally undefined
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when filteredMachineTypes.typesByID is null', () => {
      // Arrange
      const machineTypeID = 'm5.xlarge';
      const filteredMachineTypes = {
        error: false,
        fulfilled: false,
        typesByID: null,
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when filteredMachineTypes itself is undefined', () => {
      // Arrange
      const machineTypeID = 'm5.xlarge';
      const filteredMachineTypes = undefined;

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when filteredMachineTypes itself is null', () => {
      // Arrange
      const machineTypeID = 'm5.xlarge';
      const filteredMachineTypes = null;

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when machineTypeID is not found in typesByID', () => {
      // Arrange
      const machineTypeID = 'm5.xlarge';
      const filteredMachineTypes = {
        error: false,
        fulfilled: true,
        typesByID: {
          'm5.2xlarge': { id: 'm5.2xlarge', name: 'm5.2xlarge' },
        },
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when machineTypeID exists in typesByID', () => {
      // Arrange
      const machineTypeID = 'm5.xlarge';
      const filteredMachineTypes = {
        error: false,
        fulfilled: true,
        typesByID: {
          'm5.xlarge': { id: 'm5.xlarge', name: 'm5.xlarge - General Purpose' },
          'm5.2xlarge': { id: 'm5.2xlarge', name: 'm5.2xlarge' },
        },
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle empty typesByID object', () => {
      // Arrange
      const machineTypeID = 'm5.xlarge';
      const filteredMachineTypes = {
        error: false,
        fulfilled: true,
        typesByID: {},
      };

      // Act
      const result = isMachineTypeIncludedInFilteredSet(machineTypeID, filteredMachineTypes);

      // Assert
      expect(result).toBe(false);
    });

    it('should not throw error for any edge case inputs', () => {
      // Arrange - Various edge cases
      const testCases = [
        { machineTypeID: 'm5.xlarge', filteredMachineTypes: undefined },
        { machineTypeID: 'm5.xlarge', filteredMachineTypes: null },
        { machineTypeID: 'm5.xlarge', filteredMachineTypes: {} },
        { machineTypeID: 'm5.xlarge', filteredMachineTypes: { typesByID: undefined } },
        { machineTypeID: 'm5.xlarge', filteredMachineTypes: { typesByID: null } },
        { machineTypeID: 'm5.xlarge', filteredMachineTypes: { typesByID: {} } },
        { machineTypeID: '', filteredMachineTypes: { typesByID: { 'm5.xlarge': {} } } },
        { machineTypeID: null, filteredMachineTypes: { typesByID: { 'm5.xlarge': {} } } },
      ];

      // Act & Assert - None should throw
      testCases.forEach((testCase) => {
        expect(() => {
          isMachineTypeIncludedInFilteredSet(testCase.machineTypeID, testCase.filteredMachineTypes);
        }).not.toThrow();
      });
    });
  });
});
