import React from 'react';
import PropTypes from 'prop-types';

import { Radio, Split, SplitItem, Tooltip } from '@patternfly/react-core';

import PopoverHint from '../PopoverHint';

const RadioButtons = ({
  defaultValue,
  isDisabled,
  onChangeCallback,
  disableDefaultValueHandling,
  input,
  className,
  options,
}) => {
  const changeHandler = (event) => {
    const newValue = event.target.value;
    input.onChange(newValue);

    if (onChangeCallback) {
      onChangeCallback(event, newValue);
    }
  };

  const isCurrentValueDisabled = React.useCallback(() => {
    options.some(
      (option) => input.value === option.value && option.disabled && option.value !== defaultValue,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  React.useEffect(() => {
    if (!disableDefaultValueHandling || isCurrentValueDisabled()) {
      input.onChange(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!disableDefaultValueHandling) {
      // when we set the default value dynamically in the parent file
      // it was not updated until it is rendered.
      if (input.value === '') {
        input.onChange(defaultValue);
      }
    }

    if (isCurrentValueDisabled()) {
      input.onChange(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, disableDefaultValueHandling, input.value]);

  return (
    <>
      {options.map((option) => {
        const button = (
          <SplitItem className="pf-v6-u-mr-sm">
            <Radio
              className={className || ''}
              isChecked={input.value === option.value}
              key={`${input.name}-${option.value}`}
              value={option.value}
              name={input.name}
              id={`${input.name}-${option.value}`}
              data-testid={`${input.name}-${option.value}`}
              aria-label={option.ariaLabel || option.label}
              label={option.label}
              onChange={changeHandler}
              isDisabled={option.disabled || isDisabled}
              description={option.description}
            />
            {option.extraField ? option.extraField : null}
          </SplitItem>
        );

        return (
          <Split key={`${input.name}-${option.value}-fragment`}>
            {option.tooltipText ? (
              <Tooltip content={option.tooltipText} position="right">
                {button}
              </Tooltip>
            ) : (
              button
            )}
            {option.extendedHelpText ? (
              <SplitItem>
                <PopoverHint hint={option.extendedHelpText} />
              </SplitItem>
            ) : null}
          </Split>
        );
      })}
    </>
  );
};

RadioButtons.propTypes = {
  defaultValue: PropTypes.string,
  isDisabled: PropTypes.bool,
  onChangeCallback: PropTypes.func,
  disableDefaultValueHandling: PropTypes.bool,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
      ariaLabel: PropTypes.string,
      value: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
      description: PropTypes.node,
      extraField: PropTypes.node,
      extendedHelpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    }),
  ).isRequired,
};

export default RadioButtons;
