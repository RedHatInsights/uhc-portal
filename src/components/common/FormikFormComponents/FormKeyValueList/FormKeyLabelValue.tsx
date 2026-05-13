import React from 'react';

import { TextInput } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';

import LabelKeyValueProps from './LabelKeyValueProps';

const FormKeyLabelValue = ({
  input,
  meta: { touched, error },
  valueAriaLabel = 'Key-value list value',
}: LabelKeyValueProps) => (
  <>
    <TextInput
      aria-label={valueAriaLabel}
      validated={touched && error ? 'error' : 'default'}
      onChange={(_, value) => input.onChange(value)}
      value={input.value}
    />
    <FormGroupHelperText touched={touched} error={touched ? error : undefined} />
  </>
);

export default FormKeyLabelValue;
