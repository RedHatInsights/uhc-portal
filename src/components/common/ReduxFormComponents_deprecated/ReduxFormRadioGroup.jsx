import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, Radio } from '@patternfly/react-core';

const ReduxFormRadioGroup = ({
  name,
  items,
  fieldId,
  onChange,
  label,
  className,
  isDisabled,
  isRequired,
  isInline,
}) => {
  const [value, setValue] = React.useState(null);

  const handleChange = (_, event) => {
    const { value } = event.currentTarget;
    setValue(value);
    onChange(name, value);
  };

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      className={className}
      isRequired={isRequired}
      isInline={isInline}
    >
      {items.map((item) => (
        <Radio
          isChecked={value === null ? item.isChecked === true : value === item.value}
          onChange={(event, _) => handleChange(_, event)}
          value={item.value}
          label={item.label}
          isDisabled={isDisabled}
          name={`${name}:${item.value}`}
          id={`${name}:${item.value}`}
          key={`${name}:${item.value}`}
        />
      ))}
    </FormGroup>
  );
};

ReduxFormRadioGroup.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.element]).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.element]).isRequired,
      value: PropTypes.string.isRequired,
      isChecked: PropTypes.bool,
    }),
  ).isRequired,
  fieldId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.element,
  className: PropTypes.string,
  isDisabled: PropTypes.bool,
  isRequired: PropTypes.bool,
  isInline: PropTypes.bool,
};

export default ReduxFormRadioGroup;
