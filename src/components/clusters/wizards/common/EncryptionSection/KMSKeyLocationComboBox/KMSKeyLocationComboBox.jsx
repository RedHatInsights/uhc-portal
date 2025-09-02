import React from 'react';
import PropTypes from 'prop-types';

import { FormSelect, FormSelectOption } from '@patternfly/react-core';

import { usePreviousProps } from '~/hooks/usePreviousProps';

const KMSKeyLocationComboBox = ({ selectedRegion, input, kmsRegionsArray }) => {
  React.useEffect(() => {
    input.onChange(input.value || selectedRegion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevSelectedRegion = usePreviousProps(selectedRegion);

  React.useEffect(() => {
    if (prevSelectedRegion !== selectedRegion) {
      input.onChange(input.value || selectedRegion);
    }
  }, [selectedRegion, input, prevSelectedRegion]);

  const { onChange, ...restInput } = input;

  return (
    <FormSelect
      aria-label="KMS location"
      onChange={(_event, value) => onChange(value)}
      {...restInput}
    >
      {kmsRegionsArray.map((location) => (
        <FormSelectOption key={location} value={location} label={location} />
      ))}
    </FormSelect>
  );
};

KMSKeyLocationComboBox.propTypes = {
  input: PropTypes.object.isRequired,
  kmsRegionsArray: PropTypes.array,
  selectedRegion: PropTypes.string,
};

export default KMSKeyLocationComboBox;
