import React from 'react';

import { TextInput } from '@patternfly/react-core';

import LabelKeyValueProps from './LabelKeyValueProps';

const FormKeyLabelKey = ({ input, meta: { touched, error } }: LabelKeyValueProps) => (
  <>
    <TextInput
      aria-label="Key-value list key"
      validated={touched && error ? 'error' : 'default'}
      onChange={(_, value) => input.onChange(value)}
      value={input.value}
    />
    {touched && error && <span className="pf-v6-c-form__helper-text pf-m-error">{error}</span>}
  </>
);

export default FormKeyLabelKey;
