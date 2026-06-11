import React from 'react';

import { FormSelect, FormSelectOption } from '@patternfly/react-core';

export type ChannelSelectProps = {
  input: Omit<React.ComponentPropsWithoutRef<typeof FormSelect>, 'onChange' | 'children'> & {
    onChange?: (value: string) => void;
  };
  optionsDropdownData: {
    value: string;
    label: string;
  }[];
};

export const ChannelSelect = ({ optionsDropdownData, input }: ChannelSelectProps) => {
  const { onChange, ...restInput } = input;

  return (
    <FormSelect
      {...restInput}
      onChange={(_, value) => onChange?.(value as string)}
      aria-label="Channel select input"
      ouiaId="ChannelSelectInput"
    >
      {optionsDropdownData?.map((option) => (
        <FormSelectOption key={option.value} value={option.value} label={option.label} />
      ))}
    </FormSelect>
  );
};
