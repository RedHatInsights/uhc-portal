import React, { createRef, useEffect, useReducer, useState } from 'react';
import { FieldInputProps, FormikErrors } from 'formik';

import {
  FormGroup,
  HelperText,
  Popover,
  TextInputGroup,
  TextInputGroupMain,
  ValidatedOptions,
} from '@patternfly/react-core';

import { ValidationItem } from '~/components/clusters/wizards/common';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';

import './RichInputField.scss';

type State = {
  syncValidation: {
    text: string;
    validated: boolean;
    validating?: boolean;
  }[];
  asyncValidation: {
    text: string;
    validated?: boolean;
    validating?: boolean;
  }[];
};

const validationInitialState: State = {
  syncValidation: [],
  asyncValidation: [],
};

type Action =
  | {
      type: 'set-sync-validation';
      payload: {
        validated: boolean;
        text: string;
      }[];
    }
  | {
      type: 'set-async-validation';
      payload: {
        validating?: boolean;
        validated?: boolean;
        text: string;
      }[];
    }
  | {
      type: 'set-async-validating';
      value: boolean;
    };

// eslint-disable-next-line default-param-last
const validationReducer = (state = validationInitialState, action: Action): State => {
  switch (action.type) {
    case 'set-sync-validation':
      return {
        ...state,
        syncValidation: action.payload,
      };

    case 'set-async-validation':
      return {
        ...state,
        asyncValidation: action.payload,
      };

    case 'set-async-validating':
      return {
        ...state,
        asyncValidation: state.asyncValidation.map((item) => ({
          ...item,
          validating: !!action.value,
        })),
      };

    default:
      throw new Error();
  }
};

type Props = {
  label?: string;
  helpText?: string;
  extendedHelpText?: React.ReactNode;
  disabled?: boolean;
  isRequired?: boolean;
  formGroupClass?: string;
  type?:
    | 'text'
    | 'number'
    | 'search'
    | 'time'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'month'
    | 'password'
    | 'tel'
    | 'url';
  validation?: (value: string) => {
    text: string;
    validated: boolean;
  }[];
  asyncValidation?: (value: string) => {
    text: string;
    validator: () => Promise<boolean>;
  }[];
  helpTitle?: string;
  helpExample?: React.ReactNode;
  value?: string;
  name?: string;
  onChange?: (value: string) => void;
  input?: FieldInputProps<string>;
};

export const RichInputField = ({
  label,
  extendedHelpText,
  isRequired,
  input,
  disabled,
  formGroupClass,
  type = 'text',
  validation = () => [],
  asyncValidation = () => [],
  helpTitle,
  helpExample = '',
  helpText = '',
  name,
  value = '',
  onChange = () => {},
}: Props) => {
  const inputValue = input ? input.value : value;
  const inputName = String(input ? input.name : name);
  const inputOnChange = input ? input.onChange : onChange;

  const textInputRef = createRef<HTMLInputElement>();

  const {
    validateField,
    setFieldTouched,
    setFieldError,
    setFieldValue,
    isValidating: isFormValidating,
    errors: { [inputName]: error },
  } = useFormState();

  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const [validationState, validationDispatch] = useReducer(
    validationReducer,
    validationInitialState,
  );

  const evaluatedValidation = [
    ...validationState.syncValidation,
    ...validationState.asyncValidation,
  ];

  // field-level validity is affected both by failures (`false`) and incomplete items (`undefined`)
  const isValid = !touched || evaluatedValidation.every((item) => !!item.validated);
  const isValidating = touched && validationState.asyncValidation.some((item) => item.validating);
  // required to distinguish a non-valid status due to failures, from one due to incomplete evaluation
  const hasFailures = touched && evaluatedValidation.some((item) => item.validated === false);

  // validated value for TextInpuGroup
  let validated;
  if (touched && isValid) {
    validated = ValidatedOptions.success;
  } else if (touched && !isValid) {
    validated = ValidatedOptions.error;
  }

  let inputClassName = 'rich-input-field_info';
  if (touched && !isValidating) {
    if (isValid) {
      inputClassName = 'rich-input-field_valid';
    } else if (hasFailures) {
      inputClassName = 'rich-input-field_not-valid';
    }
  }

  const setAsyncValidating = (isAsyncValidating: boolean) => {
    validationDispatch({
      type: 'set-async-validating',
      value: isAsyncValidating,
    });
  };

  const populateValidation = (term: string) => {
    const populatedValidation = validation(term);
    validationDispatch({
      type: 'set-sync-validation',
      payload: populatedValidation,
    });
    return populatedValidation;
  };

  const populateAsyncValidation = (term: string) => {
    const populatedValidation = asyncValidation(term);
    validationDispatch({
      type: 'set-async-validation',
      payload: populatedValidation,
    });
    return populatedValidation;
  };

  const evaluateAsyncValidation = (
    formError: string | string[] | FormikErrors<any> | FormikErrors<any>[] | undefined,
  ) => {
    validationDispatch({
      type: 'set-async-validation',
      payload: validationState.asyncValidation.map((v) => ({
        ...v,
        validated: v.text !== formError,
      })),
    });
  };

  useEffect(() => {
    // `false` means the form validation execution has ended (as opposed to `undefined`)
    if (isFormValidating === false && inputValue) {
      evaluateAsyncValidation(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isFormValidating]);

  useEffect(() => {
    setAsyncValidating(!!isFormValidating);
  }, [isFormValidating]);

  useEffect(() => {
    if (inputValue?.length) {
      setTouched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasFailures) {
      setShowPopover(true);
    }
  }, [hasFailures]);

  useEffect(() => {
    populateValidation(inputValue);
    populateAsyncValidation(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  useEffect(() => {
    // Formik validation doesn't trigger properly during initial render; delay to after mount completed
    const timeoutId = setTimeout(() => validateField(inputName), 0);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormGroup
      fieldId={inputName}
      label={label}
      isRequired={isRequired}
      labelHelp={extendedHelpText ? <PopoverHint hint={extendedHelpText} /> : undefined}
      className={`${formGroupClass || ''}`}
    >
      <Popover
        aria-label={helpTitle}
        headerContent={helpTitle}
        isVisible={showPopover}
        position="top-end"
        withFocusTrap={false}
        shouldClose={() => {
          if (isFocused) {
            setIsFocused(false);
          } else {
            setShowPopover(false);
          }
        }}
        bodyContent={
          <HelperText component="ul" id={`rich-input-popover-${inputName}`}>
            {evaluatedValidation.map((item) => (
              <ValidationItem
                key={item.text}
                touched={touched}
                text={item.text}
                isValid={!!item.validated}
                isValidating={!!item.validating}
                isInitialized={typeof item.validated !== 'undefined'}
              />
            ))}
          </HelperText>
        }
        footerContent={helpExample}
      >
        <TextInputGroup
          {...((validated === ValidatedOptions.success || validated === ValidatedOptions.error) && {
            validated,
          })}
        >
          <TextInputGroupMain
            value={inputValue}
            inputProps={{ isRequired }}
            id={inputName}
            name={inputName}
            disabled={disabled}
            type={type}
            autoComplete="off"
            onBlur={() => {
              setIsFocused(false);
              setShowPopover(false);
              validateField(inputName);
              setTouched(true);
            }}
            onClick={() => {
              setIsFocused(true);
              setShowPopover(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setShowPopover(true);
            }}
            onChange={async (_event, val) => {
              if (!touched && val?.length) {
                setFieldTouched(inputName, true, false);
                setFieldError(inputName, '');
                setTouched(true);
              }
              await setFieldValue(inputName, val, false);
              inputOnChange(val);
            }}
            ref={textInputRef}
            aria-describedby={`rich-input-popover-${inputName}`}
            className={`${inputClassName} rich-input-field`}
          />
        </TextInputGroup>
      </Popover>
      <FormGroupHelperText touched={touched} error={error as string}>
        {helpText}
      </FormGroupHelperText>
    </FormGroup>
  );
};
