import React from 'react';

import { FormSelect, FormSelectOption } from '@patternfly/react-core';

export type ChannelGroupSelectProps = {
  input: any;
  optionsDropdownData: {
    value: string;
    label: string;
  }[];
};

export const ChannelGroupSelect = ({ optionsDropdownData, input }: ChannelGroupSelectProps) => {
  const { onChange, ...restInput } = input;

  return (
    <FormSelect
      {...restInput}
      onChange={(_, value) => onChange(value)}
      aria-label="Channel group select input"
      ouiaId="ChannelGroupSelectInput"
    >
      {optionsDropdownData?.map((option: any) => (
        <FormSelectOption key={option.value} value={option.value} label={option.label} />
      ))}
    </FormSelect>
  );
};
