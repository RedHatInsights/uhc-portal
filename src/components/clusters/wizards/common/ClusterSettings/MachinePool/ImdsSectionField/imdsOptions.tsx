import React from 'react';

import { IMDSType } from '../../../constants';

// Subset of props taken by <RadioButtons>
export type ImdsOptionType = {
  value: IMDSType;
  ariaLabel: string;
  label: React.ReactNode;
  description: React.ReactNode;
};

export const imdsOptions: ImdsOptionType[] = [
  {
    value: IMDSType.V2Only,
    ariaLabel: 'IMDSv2 only',
    label: 'Use IMDSv2 only',
    description: 'A session-oriented method with enhanced security',
  },
  {
    value: IMDSType.V1AndV2,
    ariaLabel: 'Both IMDSv1 and IMDSv2',
    label: 'Use both IMDSv1 and IMDSv2',
    description: 'Allows use of both IMDS versions for backward compatibility',
  },
];
