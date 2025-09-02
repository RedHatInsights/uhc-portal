/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox, FormGroup, Split, SplitItem, Switch } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';

import PopoverHint from '../PopoverHint';

function ReduxCheckbox(props) {
  const {
    label,
    meta: { error, touched },
    input: { name, value, ...restInput },
    isSwitch = false,
    helpText,
    extendedHelpText,
    isRequired = false,
    showInitialValidationErrors = false,
    ...extraProps // any extra props not specified above
  } = props;
  const InputComponent = isSwitch ? Switch : Checkbox;
  return (
    <FormGroup fieldId={name}>
      <Split hasGutter>
        <SplitItem>
          <InputComponent
            isChecked={!!value}
            id={name}
            name={name}
            {...restInput}
            {...extraProps}
            label={
              <>
                {label}
                {isRequired ? (
                  <span
                    className="pf-v6-c-form__label-required redux-checkbox-required"
                    aria-hidden="true"
                  >
                    *
                  </span>
                ) : null}
              </>
            }
            required={isRequired}
          />
        </SplitItem>
        {extendedHelpText && (
          <SplitItem>
            <PopoverHint hint={extendedHelpText} />
          </SplitItem>
        )}
      </Split>

      <FormGroupHelperText touched={touched || showInitialValidationErrors} error={error}>
        {helpText}
      </FormGroupHelperText>
    </FormGroup>
  );
}

ReduxCheckbox.propTypes = {
  label: PropTypes.string.isRequired,
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  isSwitch: PropTypes.bool,
  // plus other props to be passed to the field...
  isDisabled: PropTypes.bool,
  extendedHelpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  isRequired: PropTypes.bool,
  // show validation errors immediately, regardless of whether field has been touched or not
  showInitialValidationErrors: PropTypes.bool,
  isHelperTextBeforeField: PropTypes.bool,
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onChange: PropTypes.func,
  isFilled: PropTypes.bool,
};

export default ReduxCheckbox;
