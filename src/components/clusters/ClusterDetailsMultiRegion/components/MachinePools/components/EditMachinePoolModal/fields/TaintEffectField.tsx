import * as React from 'react';
import { useField, useFormikContext } from 'formik';

import { SelectOption } from '@patternfly/react-core';

import useFormikOnChange from '~/hooks/useFormikOnChange';

import SelectField from './SelectField';

export type TaintEffect = 'NoSchedule' | 'NoExecute' | 'PreferNoSchedule';

type TaintEffectFieldProps = {
  fieldId: string;
  isDisabled: boolean;
};

const TaintEffectField = ({ fieldId, isDisabled }: TaintEffectFieldProps) => {
  const [field] = useField<TaintEffect>(fieldId);
  const { setFieldTouched } = useFormikContext();
  const onChangeEffect = useFormikOnChange(fieldId);

  const onChange = React.useCallback(
    (value: string) => {
      onChangeEffect(value);
      // Touch the sibling key field so validation errors display there
      const keyFieldId = fieldId.replace(/\.effect$/, '.key');
      setTimeout(() => setFieldTouched(keyFieldId, true, true));
    },
    [onChangeEffect, fieldId, setFieldTouched],
  );

  return (
    <SelectField value={field.value} fieldId={fieldId} onSelect={onChange} isDisabled={isDisabled}>
      <SelectOption value="NoSchedule">NoSchedule</SelectOption>
      <SelectOption value="NoExecute">NoExecute</SelectOption>
      <SelectOption value="PreferNoSchedule">PreferNoSchedule</SelectOption>
    </SelectField>
  );
};

export default TaintEffectField;
