import { FieldId } from '../../constants';
import { hasAtLeastOneOpenIdClaimField } from '../IdentityProvidersPageFormikHelpers';

describe('hasAtLeastOneOpenIdClaimField', () => {
  // Test data fixtures
  const createContext = (parentData: any) => ({
    parent: parentData,
  });

  const emptyStringArray = [''];
  const whitespaceArray = ['  ', '\t', '\n'];
  const validStringArray = ['valid-value'];
  const mixedArray = ['', 'valid-value', '  '];
  const undefinedArray = [undefined];

  describe('when all fields are empty or invalid', () => {
    it('should return false when all fields are empty arrays', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: [],
        [FieldId.OPENID_NAME]: [],
        [FieldId.OPENID_PREFFERED_USERNAME]: [],
        [FieldId.OPENID_CLAIM_GROUPS]: [],
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when all fields contain only empty strings', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: emptyStringArray,
        [FieldId.OPENID_NAME]: emptyStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: emptyStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when all fields contain only whitespace', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: whitespaceArray,
        [FieldId.OPENID_NAME]: whitespaceArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: whitespaceArray,
        [FieldId.OPENID_CLAIM_GROUPS]: whitespaceArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when all fields are undefined', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: undefined,
        [FieldId.OPENID_NAME]: undefined,
        [FieldId.OPENID_PREFFERED_USERNAME]: undefined,
        [FieldId.OPENID_CLAIM_GROUPS]: undefined,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when parent member and context are undefined', () => {
      // Arrange
      const context = { parent: undefined };

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when context parent is null', () => {
      // Arrange
      const context = { parent: null };

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when OPENID_EMAIL field has valid values', () => {
    it('should return true when OPENID_EMAIL has a valid value', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: validStringArray,
        [FieldId.OPENID_NAME]: emptyStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: emptyStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when parent is not set but context has a valid value', () => {
      // Arrange
      const context = {
        [FieldId.OPENID_EMAIL]: validStringArray,
        [FieldId.OPENID_NAME]: emptyStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: emptyStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      };

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when OPENID_EMAIL has mixed values including valid ones', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: mixedArray,
        [FieldId.OPENID_NAME]: emptyStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: emptyStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when OPENID_NAME field has valid values', () => {
    it('should return true when OPENID_NAME has a valid value', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: emptyStringArray,
        [FieldId.OPENID_NAME]: validStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: emptyStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when OPENID_PREFFERED_USERNAME field has valid values', () => {
    it('should return true when OPENID_PREFFERED_USERNAME has a valid value', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: emptyStringArray,
        [FieldId.OPENID_NAME]: emptyStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: validStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when OPENID_CLAIM_GROUPS field has valid values', () => {
    it('should return true when OPENID_CLAIM_GROUPS has a valid value', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: emptyStringArray,
        [FieldId.OPENID_NAME]: emptyStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: emptyStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: validStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when multiple fields have valid values', () => {
    it('should return true when multiple fields have valid values', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: validStringArray,
        [FieldId.OPENID_NAME]: validStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: emptyStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when all fields have valid values', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: validStringArray,
        [FieldId.OPENID_NAME]: validStringArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: validStringArray,
        [FieldId.OPENID_CLAIM_GROUPS]: validStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Test function works as expected with various UI cases', () => {
    it('should return false when fields contain undefined values', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: undefinedArray,
        [FieldId.OPENID_NAME]: undefinedArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: undefinedArray,
        [FieldId.OPENID_CLAIM_GROUPS]: undefinedArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when at least one field has valid value among mixed invalid values', () => {
      // Arrange
      const context = createContext({
        [FieldId.OPENID_EMAIL]: undefinedArray,
        [FieldId.OPENID_NAME]: whitespaceArray,
        [FieldId.OPENID_PREFFERED_USERNAME]: ['valid-username'],
        [FieldId.OPENID_CLAIM_GROUPS]: emptyStringArray,
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle missing fields in parent object', () => {
      // Arrange
      const context = createContext({
        // Missing some fields intentionally
        [FieldId.OPENID_EMAIL]: validStringArray,
        // Other fields are undefined
      });

      // Act
      const result = hasAtLeastOneOpenIdClaimField(context);

      // Assert
      expect(result).toBe(true);
    });
  });
});
