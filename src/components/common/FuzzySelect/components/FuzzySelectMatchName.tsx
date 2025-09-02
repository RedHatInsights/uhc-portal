import React from 'react';

import { getIdSlices } from '~/common/fuzzyUtils';
import { FuzzyEntryType } from '~/components/common/FuzzySelect/types';

interface FuzzySelectMatchNameProps {
  /** Fuzzy select entry to match */
  entry: FuzzyEntryType;
  /** Filter string to be matched */
  filterText: string;
}

/**
 * Creates the display label of a FuzzyEntry that matches the filter text
 * It splits the label in several parts, with the parts that match the filter text bolded.
 */
export const FuzzySelectMatchName: React.FC<FuzzySelectMatchNameProps> = ({
  entry,
  filterText,
}) => (
  <>
    {getIdSlices(entry.label, filterText).map((idSplit, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={`slice-${index}`} className={idSplit.isBold ? 'pf-v6-u-font-weight-bold' : ''}>
        {idSplit.text}
      </span>
    ))}
  </>
);
