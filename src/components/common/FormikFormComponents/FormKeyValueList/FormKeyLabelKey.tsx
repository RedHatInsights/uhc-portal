import React from 'react';

import { TextInput } from '@patternfly/react-core';

import { FormGroupHelperText } from '../../FormGroupHelperText';

import LabelKeyValueProps from './LabelKeyValueProps';

const FormKeyLabelKey = ({
  input,
  meta: { touched, error },
  keyInputAriaLabel = 'Key-value list key',
}: LabelKeyValueProps) => (
  <>
    <TextInput
      aria-label={keyInputAriaLabel}
      validated={touched && error ? 'error' : 'default'}
      onChange={(_, value) => input.onChange(value)}
      value={input.value}
    />
    <FormGroupHelperText touched={touched} error={touched ? error : undefined} />
  </>
);

export default FormKeyLabelKey;
