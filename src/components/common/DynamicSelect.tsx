import React from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';

import {
  Alert,
  Button,
  Content,
  FormGroup,
  FormSelect,
  FormSelectOption,
  FormSelectProps,
} from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { PromiseReducerState } from '~/redux/state';

import ErrorBox from './ErrorBox';

type Props = {
  input: FieldInputProps<string>;
  meta: Pick<FieldMetaProps<FormSelectProps>, 'error' | 'touched'>;
  isRequired?: boolean;
  label: string;
  labelIcon?: React.ReactElement;
  helperText?: string;
  placeholder: string;
  emptyAlertTitle?: React.ReactNode;
  emptyAlertBody?: React.ReactNode;
  refreshButtonText?: React.ReactNode;
  noDependenciesPlaceholder?: string;
  requestErrorTitle: string;
  hasDependencies: boolean;
  matchesDependencies: boolean;
  loadData: () => void;
  requestStatus: PromiseReducerState;
  items: string[];
};

/**
 * Generic select field whose options are fetched dynamically, and might depend on other fields.
 * Concrete behavior to be injected via props.
 */
const DynamicSelect = ({
  input,
  meta,
  isRequired,
  label,
  labelIcon,
  helperText,
  placeholder,
  emptyAlertTitle,
  emptyAlertBody,
  refreshButtonText,
  noDependenciesPlaceholder,
  requestErrorTitle,
  hasDependencies,
  matchesDependencies,
  loadData,
  requestStatus,
  items,
}: Props) => {
  const currentValueIrrelevant = React.useCallback(() => {
    if (!input.value) {
      // Blank/placeholder always legitimate.
      return false;
    }
    if (!hasDependencies) {
      // Can't make request.
      return true;
    }
    if (matchesDependencies && requestStatus.fulfilled) {
      // Made request and current value is no longer valid.
      return !items.includes(input.value);
    }
    return false;
  }, [hasDependencies, input.value, matchesDependencies, requestStatus.fulfilled, items]);

  React.useEffect(() => {
    if (hasDependencies && !matchesDependencies && !requestStatus.pending) {
      loadData();
    }

    if (currentValueIrrelevant()) {
      input.onChange('');
    }
  }, [
    input,
    hasDependencies,
    matchesDependencies,
    requestStatus.pending,
    loadData,
    currentValueIrrelevant,
  ]);

  const show = matchesDependencies && requestStatus.fulfilled;

  let error = null;
  let options = null;

  if (show) {
    if (items.length > 0) {
      options = (
        <>
          <FormSelectOption isDisabled isPlaceholder value="" label={placeholder} />
          {items.map((item) => (
            <FormSelectOption key={item} value={item} label={item} />
          ))}
        </>
      );
    } else {
      error = (
        <Alert isInline variant="danger" title={emptyAlertTitle} role="alert">
          <Content>
            {emptyAlertBody}
            {refreshButtonText && (
              <Content component="p">
                <Button variant="secondary" onClick={loadData}>
                  {refreshButtonText}
                </Button>
              </Content>
            )}
          </Content>
        </Alert>
      );
      options = <FormSelectOption isDisabled isPlaceholder value="" label="" />;
    }
  } else if (requestStatus.pending) {
    options = <FormSelectOption isDisabled value="" label="Loading..." />;
  } else if (matchesDependencies && requestStatus.error) {
    error = <ErrorBox message={requestErrorTitle} response={requestStatus} />;
    options = <FormSelectOption isDisabled isPlaceholder value="" label="" />;
  } else {
    options = <FormSelectOption isDisabled value="" label={noDependenciesPlaceholder || ''} />;
  }

  // Prevent FormSelect from picking wrong option when valid options changed.
  // https://github.com/patternfly/patternfly-react/issues/5687
  const value = currentValueIrrelevant() ? '' : input.value;

  const { onChange, ...restInput } = input;

  return (
    <FormGroup label={label} labelHelp={labelIcon} fieldId={input.name} isRequired={isRequired}>
      {error}
      <FormSelect
        aria-label={label}
        isDisabled={!(show && items.length > 0)}
        validated={meta.touched && meta.error ? 'error' : 'default'}
        {...restInput}
        onChange={(_event, value) => onChange(value)}
        value={value}
      >
        {options}
      </FormSelect>

      <FormGroupHelperText touched={meta.touched} error={meta.error}>
        {helperText}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default DynamicSelect;
