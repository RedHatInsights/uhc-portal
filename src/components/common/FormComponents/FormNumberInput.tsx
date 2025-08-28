import React from 'react';

import { NumberInput, NumberInputProps, Stack, StackItem } from '@patternfly/react-core';

interface Props extends NumberInputProps {
  input: { onChange: (value: string | number) => void; value: number };
  meta: { error: string | undefined };
  min: number;
  max: number;
  validated: 'error' | 'default';
  helperTextInvalid: string | undefined;
}

const FormNumberInput = ({ meta, input, ...restProps }: Props) => {
  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    input.onChange(e.currentTarget.value);
  };

  const onPlusOrMinus = (isPlus: boolean) => {
    let newSize = input.value;

    const { min, max } = restProps;
    if (isPlus) {
      if (newSize < min) {
        newSize = min;
      } else {
        newSize += 1;
      }
    } else if (newSize > max) {
      newSize = max;
    } else {
      newSize -= 1;
    }
    input.onChange(newSize);
  };

  return (
    <Stack>
      <StackItem>
        <NumberInput
          {...restProps}
          validated={meta.error ? 'error' : 'default'}
          value={input.value}
          onChange={onChange}
          onPlus={() => onPlusOrMinus(true)}
          onMinus={() => onPlusOrMinus(false)}
        />
      </StackItem>
      {meta.error && (
        <StackItem className="pf-v6-u-danger-color-100 pf-v6-u-font-size-sm">
          {meta.error}
        </StackItem>
      )}
    </Stack>
  );
};

export default FormNumberInput;
