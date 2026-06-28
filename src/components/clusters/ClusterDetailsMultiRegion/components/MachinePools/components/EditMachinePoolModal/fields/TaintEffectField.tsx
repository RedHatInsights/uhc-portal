import * as React from 'react';
import { useField, useFormikContext } from 'formik';

import { SelectOption } from '@patternfly/react-core';

import useFormikOnChange from '~/hooks/useFormikOnChange';

import SelectField from './SelectField';

export type TaintEffect = 'NoSchedule' | 'NoExecute' | 'PreferNoSchedule';

type TaintEffectFieldProps = {
  fieldId: string;
  keyFieldId: string;
  isDisabled: boolean;
};

const TaintEffectField = ({ fieldId, keyFieldId, isDisabled }: TaintEffectFieldProps) => {
  const [field] = useField<TaintEffect>(fieldId);
  const { setFieldTouched } = useFormikContext();
  const onChangeEffect = useFormikOnChange(fieldId);

  const onChange = (value: string) => {
    onChangeEffect(value);
    setFieldTouched(keyFieldId, true, true);
  };

  return (
    <SelectField value={field.value} fieldId={fieldId} onSelect={onChange} isDisabled={isDisabled}>
      <SelectOption value="NoSchedule">NoSchedule</SelectOption>
      <SelectOption value="NoExecute">NoExecute</SelectOption>
      <SelectOption value="PreferNoSchedule">PreferNoSchedule</SelectOption>
    </SelectField>
  );
};

export default TaintEffectField;
