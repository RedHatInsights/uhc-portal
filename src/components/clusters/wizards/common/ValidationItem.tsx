import React from 'react';

import { HelperTextItem } from '@patternfly/react-core';

interface ValidationItemProps {
  text: string;
  isValid: boolean;
  touched: boolean;
  isValidating: boolean;
  isInitialized: boolean;
}

type HelperTextItemVariant = 'default' | 'indeterminate' | 'warning' | 'success' | 'error';

export const ValidationItem = ({
  text,
  touched,
  isValid,
  isValidating,
  isInitialized,
}: ValidationItemProps) => {
  if (!text) {
    return null;
  }

  let variant: HelperTextItemVariant = 'default';
  let iconAlt = '';
  if (touched) {
    if (!isInitialized || isValidating) {
      variant = 'indeterminate';
      iconAlt = 'Pending: ';
    } else {
      variant = isValid ? 'success' : 'error';
      iconAlt = isValid ? 'Satisfied: ' : 'Not met: ';
    }
  }

  return (
    <HelperTextItem variant={variant} component="li" key={text}>
      <span className="pf-v6-u-screen-reader">{iconAlt}</span>
      {text}
    </HelperTextItem>
  );
};
