import { FormSelect, FormSelectOption } from '@patternfly/react-core';
import React from 'react';

export type ChannelGroupSelectProps = {
  input: any;
  optionsDropdownData: any;
};

export const ChannelGroupSelect = ({ optionsDropdownData, input }: ChannelGroupSelectProps) => {
  const { onChange, ...restInput } = input;

  return (
    <FormSelect
      {...restInput}
      onChange={(_, value) => onChange(value)}
      aria-label="FormSelect Input"
      ouiaId="BasicFormSelect"
    >
      {optionsDropdownData?.map((option: any) => (
        <FormSelectOption key={option.value} value={option.value} label={option.label} />
      ))}
    </FormSelect>
  );
};
