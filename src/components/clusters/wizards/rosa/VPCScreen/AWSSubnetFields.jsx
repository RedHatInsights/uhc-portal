import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import { GridItem } from '@patternfly/react-core';

import { getMatchingAvailabilityZones } from '~/common/vpcHelpers';
import { SubnetSelectField } from '~/components/clusters/common/SubnetSelectField';
import AvailabilityZoneSelection from '~/components/clusters/wizards/common/NetworkingSection/AvailabilityZoneSelection';
import VPCDropdown from '~/components/clusters/wizards/common/VPCDropdown/VPCDropdown';
import { useFormState } from '~/components/clusters/wizards/hooks';
import WithTooltip from '~/components/common/WithTooltip';
import useFormikOnChange from '~/hooks/useFormikOnChange';

import { required, validateUniqueAZ } from '../../../../../common/validators';
import { FieldId } from '../constants';

const SingleSubnetFieldsRow = ({
  index,
  selectedAZ,
  selectedRegion,
  selectedVPC,
  isMultiAz,
  privateLinkSelected,
}) => {
  const {
    setFieldValue,
    getFieldProps,
    getFieldMeta,
    validateField,
    values: { [FieldId.MachinePoolsSubnets]: machinePoolsSubnets },
  } = useFormState();
  const azFieldName = `${FieldId.MachinePoolsSubnets}[${index}].availabilityZone`;
  const privateSubnetIdName = `${FieldId.MachinePoolsSubnets}[${index}].privateSubnetId`;
  const publicSubnetIdName = `${FieldId.MachinePoolsSubnets}[${index}].publicSubnetId`;

  const azValidations = (value) =>
    required(value) || (isMultiAz && validateUniqueAZ(value, { machinePoolsSubnets }));

  React.useEffect(() => {
    if (selectedAZ) {
      validateField(azFieldName);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showLabels = index === 0;
  let disabledSubnetReason;
  let disabledAzReason;
  if (!selectedVPC?.id) {
    disabledAzReason = 'Select a VPC first';
    disabledSubnetReason = 'Select a VPC first';
  } else if (!selectedAZ) {
    disabledSubnetReason = 'Select the availability zone';
  }

  // We'll only allow users to select AZs that have all necessary subnets
  const privacyList = privateLinkSelected ? ['private'] : ['private', 'public'];
  const enabledAvailabilityZones = getMatchingAvailabilityZones(
    selectedRegion,
    selectedVPC,
    privacyList,
  );

  return (
    <>
      <GridItem md={4}>
        <WithTooltip showTooltip={!!disabledAzReason} content={disabledAzReason}>
          <Field
            component={AvailabilityZoneSelection}
            name={azFieldName}
            label={showLabels ? 'Availability zone' : null}
            enabledAvailabilityZones={enabledAvailabilityZones}
            vpcId={selectedVPC?.id}
            validate={azValidations}
            isDisabled={!!disabledAzReason}
            region={selectedRegion}
            input={{
              ...getFieldProps(azFieldName),
              onChange: useFormikOnChange(azFieldName),
            }}
            meta={getFieldMeta(azFieldName)}
          />
        </WithTooltip>
      </GridItem>
      <GridItem md={4}>
        <WithTooltip showTooltip={!!disabledSubnetReason} content={disabledSubnetReason}>
          <Field
            component={SubnetSelectField}
            name={privateSubnetIdName}
            isRequired
            validate={required}
            privacy="private"
            label={showLabels ? 'Private subnet' : null}
            selectedVPC={selectedVPC}
            allowedAZs={selectedAZ ? [selectedAZ] : []}
            withAutoSelect={false}
            input={{
              ...getFieldProps(privateSubnetIdName),
              onChange: (value) => setFieldValue(privateSubnetIdName, value),
            }}
            meta={getFieldMeta(privateSubnetIdName)}
          />
        </WithTooltip>
      </GridItem>
      <GridItem md={4}>
        {!privateLinkSelected && (
          <WithTooltip showTooltip={!!disabledSubnetReason} content={disabledSubnetReason}>
            <Field
              component={SubnetSelectField}
              name={publicSubnetIdName}
              isRequired
              validate={required}
              privacy="public"
              label={showLabels ? 'Public subnet' : null}
              selectedVPC={selectedVPC}
              allowedAZs={selectedAZ ? [selectedAZ] : []}
              withAutoSelect={false}
              input={{
                ...getFieldProps(publicSubnetIdName),
                onChange: (value) => setFieldValue(publicSubnetIdName, value),
              }}
              meta={getFieldMeta(publicSubnetIdName)}
            />
          </WithTooltip>
        )}
      </GridItem>
    </>
  );
};

const AWSSubnetFields = ({
  selectedVPC,
  selectedRegion,
  selectedAZs,
  isMultiAz,
  privateLinkSelected,
}) => {
  const { setFieldValue, getFieldProps, getFieldMeta } = useFormState();
  const controlPlaneFieldName = `${FieldId.SecurityGroups}.controlPlane`;
  const infraFieldName = `${FieldId.SecurityGroups}.infra`;
  const workerFieldName = `${FieldId.SecurityGroups}.worker`;

  return (
    <>
      <Field
        component={VPCDropdown}
        name={FieldId.SelectedVpc}
        validate={(value) => (!value?.id && !value?.name ? 'error' : undefined)}
        selectedVPC={selectedVPC}
        showRefresh
        isHypershift={false}
        usePrivateLink={privateLinkSelected}
        input={{
          ...getFieldProps(FieldId.SelectedVpc),
          onChange: (newVpcValue) => {
            setFieldValue(FieldId.SelectedVpc, newVpcValue);
            setFieldValue(controlPlaneFieldName, []);
            setFieldValue(infraFieldName, []);
            setFieldValue(workerFieldName, []);
          },
        }}
        meta={getFieldMeta(FieldId.SelectedVpc)}
      />

      <SingleSubnetFieldsRow
        index={0}
        selectedAZ={selectedAZs[0]}
        selectedRegion={selectedRegion}
        selectedVPC={selectedVPC}
        isMultiAz={isMultiAz}
        privateLinkSelected={privateLinkSelected}
      />
      {isMultiAz && (
        <>
          <SingleSubnetFieldsRow
            index={1}
            selectedAZ={selectedAZs[1]}
            selectedRegion={selectedRegion}
            selectedVPC={selectedVPC}
            isMultiAz={isMultiAz}
            privateLinkSelected={privateLinkSelected}
          />
          <SingleSubnetFieldsRow
            index={2}
            selectedAZ={selectedAZs[2]}
            selectedRegion={selectedRegion}
            selectedVPC={selectedVPC}
            isMultiAz={isMultiAz}
            privateLinkSelected={privateLinkSelected}
          />
        </>
      )}
    </>
  );
};

SingleSubnetFieldsRow.propTypes = {
  selectedRegion: PropTypes.string,
  selectedVPC: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  selectedAZ: PropTypes.string,
  index: PropTypes.number,
  isMultiAz: PropTypes.bool,
  privateLinkSelected: PropTypes.bool,
};

AWSSubnetFields.propTypes = {
  selectedVPC: PropTypes.object,
  selectedRegion: PropTypes.string,
  selectedAZs: PropTypes.arrayOf(PropTypes.string),
  isMultiAz: PropTypes.bool,
  privateLinkSelected: PropTypes.bool,
};

export { SingleSubnetFieldsRow };
export default AWSSubnetFields;
