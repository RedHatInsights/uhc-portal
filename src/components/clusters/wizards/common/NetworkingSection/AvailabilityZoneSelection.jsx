import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';

import './AvailabilityZoneSelection.scss';

// AWS availability zones are comprised from the region name
// followed by a single letter. For more information please see:
// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-availability-zones
const azLetters = ['a', 'b', 'c', 'd', 'e', 'f'];

const AvailabilityZoneSelection = ({
  input,
  vpcId: newVpcId,
  isDisabled,
  enabledAvailabilityZones,
  region,
  label,
  meta: { error, touched },
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const prevVpc = React.useRef(newVpcId);

  React.useEffect(() => {
    if (prevVpc.current !== newVpcId && input.value) {
      input.onChange('');
    }
  }, [input, newVpcId, prevVpc]);

  const onToggle = (isOpen) => {
    setIsOpen(isOpen);
  };

  const onSelect = (_, selection) => {
    setIsOpen(false);
    input.onChange(selection);
  };

  const availabilityZones = azLetters
    .map((letter) => ({
      zoneId: `${region}${letter}`,
      isDisabled:
        enabledAvailabilityZones && !enabledAvailabilityZones.includes(`${region}${letter}`),
    }))
    .sort((azA, azB) => {
      if (azA.isDisabled && !azB.isDisabled) {
        return 1;
      }
      if (azB.isDisabled && !azA.isDisabled) {
        return -1;
      }
      return azA.zoneId.localeCompare(azB.zoneId);
    });

  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => onToggle(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      isFullWidth
      aria-label="Options menu"
      className="availability-zone-select"
    >
      {input.value ? input.value : 'Select availability zone'}
    </MenuToggle>
  );

  return (
    <FormGroup fieldId={input.name} label={label} className="ocm-c-create-osd-az-select" isRequired>
      <Select
        isOpen={isOpen}
        selected={input.value}
        onOpenChange={(isOpen) => onToggle(isOpen)}
        toggle={toggle}
        onSelect={onSelect}
        aria-label={label}
      >
        <SelectList aria-label="availability zone list">
          {availabilityZones.map(({ zoneId, isDisabled }) => (
            <SelectOption
              key={zoneId}
              value={zoneId}
              isDisabled={isDisabled}
              description={isDisabled ? 'This zone does not have all required subnets' : undefined}
            >
              {zoneId}
            </SelectOption>
          ))}
        </SelectList>
      </Select>

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
};

AvailabilityZoneSelection.propTypes = {
  isDisabled: PropTypes.bool,
  label: PropTypes.string,
  region: PropTypes.string,
  enabledAvailabilityZones: PropTypes.arrayOf(PropTypes.string),
  vpcId: PropTypes.string,
  input: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
  }),
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
};

export default AvailabilityZoneSelection;
