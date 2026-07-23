export type FuzzyEntryType = {
  groupId?: string;
  entryId: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** When adjacent options have different dividerGroup values, a PatternFly Divider is rendered between them. */
  dividerGroup?: string;
};
export type FuzzyEntryGroup = Record<string, FuzzyEntryType[]>;
export type FuzzyDataType = FuzzyEntryType[] | FuzzyEntryGroup;
