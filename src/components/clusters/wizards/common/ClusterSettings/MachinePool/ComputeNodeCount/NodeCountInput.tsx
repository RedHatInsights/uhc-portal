import React, { useEffect } from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';

import { FormGroup, NumberInput } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

type NodeCountInputProps = {
  input: FieldInputProps<string>;
  meta: FieldMetaProps<string>;
  label?: string;
  extendedHelpText?: string | React.ReactNode;
  minNodes: number;
  maxNodes: number;
  buttonAriaLabel?: string;
  isDisabled: boolean;
  displayError: (limit: string, error: string) => void;
  hideError: (limit: string) => void;
};

const NodeCountInput = (props: NodeCountInputProps) => {
  const {
    input,
    meta: { error },
    label,
    extendedHelpText,
    minNodes,
    maxNodes,
    buttonAriaLabel,
    isDisabled,
    displayError,
    hideError,
  } = props;

  useEffect(() => {
    if (error) {
      displayError('nodes', error);
    } else {
      hideError('nodes');
    }
  }, [error, displayError, hideError]);

  const onButtonPress = (plus: boolean) => () => {
    if (plus) {
      return input.onChange(Number(input.value) + 1);
    }
    return input.onChange(Number(input.value) - 1);
  };

  return (
    <FormGroup
      fieldId={input.name}
      label={label}
      labelHelp={
        extendedHelpText ? (
          <PopoverHint hint={extendedHelpText} buttonAriaLabel={buttonAriaLabel} />
        ) : undefined
      }
    >
      <NumberInput
        value={Number(input.value)}
        min={minNodes}
        max={maxNodes}
        onMinus={onButtonPress(false)}
        onChange={(event) => input.onChange((event.target as HTMLInputElement).value)}
        onPlus={onButtonPress(true)}
        inputAriaLabel="Compute nodes"
        minusBtnAriaLabel="Decrement compute nodes"
        plusBtnAriaLabel="Increment compute nodes"
        widthChars={4}
        inputProps={{
          onBlur: (event: React.ChangeEvent<HTMLInputElement>) => {
            // strips unnecessary leading zeros
            // https://issues.redhat.com/browse/HAC-830
            // eslint-disable-next-line no-param-reassign
            event.target.value = Number(event.target.value).toString();
            input.onBlur(event);
          },
        }}
        isDisabled={isDisabled}
      />
    </FormGroup>
  );
};
export default NodeCountInput;
