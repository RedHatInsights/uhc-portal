import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  FormGroup,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Menu,
  MenuContent,
  MenuItem,
  MenuItemAction,
  MenuList,
  Popper,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon } from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import { EyeSlashIcon } from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import { RedoIcon } from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';

import PopoverHint from '../PopoverHint';

const ReduxVerticalFormGroup = ({
  label,
  helpText = '',
  extendedHelpText,
  isRequired = false,
  meta: { error, touched },
  input,
  disabled,
  isTextArea,
  // eslint-disable-next-line no-unused-vars
  showHelpTextOnError = true, // this may be used to pass down to child components
  inputPrefix = '',
  formGroupClass,
  hasOtherValidation = false,
  onAutocomplete,
  getAutocompleteValue,
  getAutocompleteText = (value) => value,
  ...extraProps // any extra props not specified above
}) => {
  const [inputValueHidden, setInputValueHidden] = React.useState(true);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = React.useState(false);
  const [autocompleteValue, setAutocompleteValue] = React.useState(
    getAutocompleteValue ? getAutocompleteValue() : undefined,
  );
  const InputComponent = isTextArea ? TextArea : TextInput;
  // TextArea and TextInput has different ways to specify if the component is disabled
  // this forces us to do this trick:
  const disabledPropName = isTextArea ? 'disabled' : 'isDisabled';
  const disabledProp = {
    [disabledPropName]: disabled,
  };
  const isPassword = extraProps.type === 'password';
  const redoId = `${extraProps.id || ''}-redo`;
  const isValid = hasOtherValidation || !touched || !error;

  const regenerateAutocomplete = () => {
    if (getAutocompleteValue) {
      setAutocompleteValue(getAutocompleteValue());
    }
  };

  let { onFocus } = input;
  let { onBlur } = input;
  let autocomplete;
  if (getAutocompleteValue) {
    const onSelect = (event) => {
      event.stopPropagation();
      input.onChange(autocompleteValue);
      if (onAutocomplete) {
        onAutocomplete(autocompleteValue, input.name);

        // Temporary bugfix for OCMUI-2823
        regenerateAutocomplete();
      }
      setIsAutocompleteOpen(false);
    };

    onFocus = (...args) => {
      setIsAutocompleteOpen(true);
      if (input.onFocus) {
        input.onFocus(...args);
      }
    };

    onBlur = (...args) => {
      if (
        args[0].relatedTarget?.attributes?.role?.nodeValue !== 'menuitem' &&
        args[0].relatedTarget?.id !== redoId
      ) {
        setIsAutocompleteOpen(false);
      }
      if (input.onBlur) {
        input.onBlur(...args);
      }
    };

    autocomplete = (
      <Menu onSelect={onSelect}>
        <MenuContent>
          <MenuList>
            <MenuItem
              itemId={0}
              actions={
                <MenuItemAction
                  icon={<RedoIcon aria-hidden />}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    regenerateAutocomplete();
                  }}
                  actionId="redo"
                  id={redoId}
                  aria-label="Redo"
                />
              }
            >
              {getAutocompleteText(autocompleteValue)}
            </MenuItem>
          </MenuList>
        </MenuContent>
      </Menu>
    );
  }

  // Remove non-valid props for Input
  const { getHelpText, getPlaceholderText, ...cleanedExtraProps } = extraProps;

  const inputGroup = (
    <InputGroup className={isValid && 'valid-field'}>
      {inputPrefix ? (
        <InputGroupItem>
          <InputGroupText>{inputPrefix}</InputGroupText>
        </InputGroupItem>
      ) : null}
      <InputGroupItem isFill>
        <InputComponent
          isRequired={isRequired}
          validated={isValid ? 'default' : 'error'}
          {...disabledProp}
          {...input}
          {...cleanedExtraProps}
          id={input.name || input.id || 'text-input-fallback'}
          type={isPassword && !inputValueHidden ? 'text' : extraProps.type}
          onFocus={onFocus}
          onBlur={onBlur}
          className={formGroupClass}
        />
      </InputGroupItem>
      {isPassword && (
        <InputGroupItem>
          <Button
            aria-label={inputValueHidden ? 'show-password' : 'hide-password'}
            variant="control"
            onClick={() => setInputValueHidden((prev) => !prev)}
          >
            {inputValueHidden ? <EyeSlashIcon /> : <EyeIcon />}
          </Button>
        </InputGroupItem>
      )}
    </InputGroup>
  );

  return (
    <FormGroup
      fieldId={input.name}
      label={label}
      isRequired={isRequired}
      labelHelp={extendedHelpText && <PopoverHint hint={extendedHelpText} />}
      className={formGroupClass}
    >
      {getAutocompleteValue && (
        <Popper
          trigger={inputGroup}
          popper={autocomplete}
          isVisible={isAutocompleteOpen}
          enableFlip={false}
        />
      )}
      {!getAutocompleteValue && inputGroup}

      <FormGroupHelperText touched={touched} error={error} id={`${input.name}-helper`}>
        {helpText}
      </FormGroupHelperText>
    </FormGroup>
  );
};

ReduxVerticalFormGroup.propTypes = {
  label: PropTypes.string,
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  extendedHelpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  disabled: PropTypes.bool,

  input: PropTypes.object.isRequired,

  meta: PropTypes.object.isRequired,
  // is this a required field?
  isRequired: PropTypes.bool,
  // Render a textarea instead of a textinput?
  isTextArea: PropTypes.bool,
  hasOtherValidation: PropTypes.bool,
  // plus other props passed from the <Field> component to the control (extraProps,
  // incl. children)...
  showHelpTextOnError: PropTypes.bool,
  inputPrefix: PropTypes.string,
  formGroupClass: PropTypes.string,
  onAutocomplete: PropTypes.func,
  getAutocompleteValue: PropTypes.func,
  getAutocompleteText: PropTypes.func,
};

export default ReduxVerticalFormGroup;
