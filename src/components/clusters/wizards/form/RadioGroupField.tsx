import React from 'react';
import classNames from 'classnames';

import { Flex, FormGroup, Tooltip } from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import PopoverHint from '~/components/common/PopoverHint';

import { RadioButtonField } from './CustomRadioButtonField';

enum RadioGroupDirection {
  Row = 'row',
  Column = 'column',
}

export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  popoverHint?: React.ReactNode;
  shouldCheck?: (fieldValue: string, radioValue: React.ReactText) => boolean;
}

interface RadioGroupFieldProps {
  name: string;
  options: RadioGroupOption[];
  label?: React.ReactNode;
  isRequired?: boolean;
  direction?: 'row' | 'column';
  onChange?(event: React.FormEvent<HTMLDivElement>, value: string): void;
}

export const RadioGroupField = ({
  name,
  label,
  options,
  onChange,
  isRequired,
  direction = RadioGroupDirection.Column,
}: RadioGroupFieldProps) => {
  const { setFieldValue } = useFormState();

  return (
    <FormGroup label={label} fieldId={name} isRequired={isRequired}>
      <Flex
        direction={{ default: direction }}
        spaceItems={{
          default: `spaceItems${direction === RadioGroupDirection.Column ? 'Md' : 'Lg'}`,
        }}
      >
        {options.map((option) => {
          const radioButton = (
            <RadioButtonField
              name={name}
              label={option.label}
              value={option.value}
              isDisabled={option.disabled}
              description={option.description}
              className={classNames('pf-v6-u-mb-md', { 'pf-v6-u-mr-sm': !!option.popoverHint })}
              onChange={(value) => {
                setFieldValue(name, value);
                // pf-formik's RadioButtonField change handler does not return an event to forward
                onChange?.(null as unknown as React.FormEvent<HTMLDivElement>, value?.toString());
              }}
              shouldCheck={option.shouldCheck}
            />
          );

          return (
            <Flex
              alignItems={{ default: 'alignItemsFlexStart' }}
              key={option.value}
              className="pf-m-nowrap"
            >
              {option.tooltip ? (
                <Tooltip content={option.tooltip} position="right">
                  {radioButton}
                </Tooltip>
              ) : (
                radioButton
              )}

              {option.popoverHint && <PopoverHint hint={option.popoverHint} />}
            </Flex>
          );
        })}
      </Flex>
    </FormGroup>
  );
};
