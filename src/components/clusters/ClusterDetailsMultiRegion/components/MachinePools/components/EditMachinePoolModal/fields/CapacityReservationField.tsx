import React from 'react';
import { useField } from 'formik';
import semver from 'semver';

import {
  Flex,
  FlexItem,
  FormGroup,
  HelperText,
  HelperTextItem,
  SelectOption,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import ExternalLink from '~/components/common/ExternalLink';
import TextField from '~/components/common/formik/TextField';
import PopoverHint from '~/components/common/PopoverHint';
import useFormikOnChange from '~/hooks/useFormikOnChange';
import { CAPACITY_RESERVATION_ID_FIELD } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { ClusterFromSubscription } from '~/types/types';

import SelectField from './SelectField';

const crIdFieldId = 'capacityReservationId';
const crPreferenceFieldId = 'capacityReservationPreference';

export type CapacityReservationPreference = 'none' | 'open' | 'capacity-reservations-only';

type CapacityReservationFieldProps = {
  cluster: ClusterFromSubscription;
  isEdit?: boolean;
};

const options = [
  { label: 'None', value: 'none' },
  { label: 'Open', value: 'open' },
  { label: 'CR only', value: 'capacity-reservations-only' },
];

const CapacityReservationField = ({ cluster, isEdit }: CapacityReservationFieldProps) => {
  const isCapacityReservationEnabled = useFeatureGate(CAPACITY_RESERVATION_ID_FIELD);
  const capacityPreferenceField = useField(crPreferenceFieldId)[0];
  const [, , helpers] = useField(crIdFieldId);
  const { setValue } = helpers;
  const isCROnly = capacityPreferenceField.value === 'capacity-reservations-only';
  const clusterVersion = cluster?.openshift_version || cluster?.version?.raw_id || '';
  const requiredVersion = '4.19.0';
  const isValidVersion = semver.valid(clusterVersion)
    ? semver.gte(clusterVersion, requiredVersion)
    : false;

  const canUseCapacityReservation =
    isHypershiftCluster(cluster) && isCapacityReservationEnabled && !isEdit;

  const OnChange = useFormikOnChange(crPreferenceFieldId);

  React.useEffect(() => {
    if (!isCROnly) {
      setValue('');
    }
  }, [isCROnly, setValue]);

  const selectedOption =
    options.find((option) => option.value === capacityPreferenceField.value) || options[0];

  return canUseCapacityReservation ? (
    <FormGroup
      label="Capacity Reservation"
      labelHelp={
        <PopoverHint
          buttonAriaLabel="Capacity reservation information"
          hint={
            <>
              ID of Capacity Reservation or Capacity Blocks for ML. Requires control plane version
              4.19.0 or above. Learn more about{' '}
              <ExternalLink href={links.AWS_CAPACITY_RESERVATION}>
                Capacity Reservations
              </ExternalLink>
            </>
          }
        />
      }
    >
      <Flex className="pf-v6-u-ml-sm">
        <FlexItem>Reservation Preference: </FlexItem>
        <FlexItem>
          <SelectField
            value={capacityPreferenceField.value}
            fieldId={crPreferenceFieldId}
            label={selectedOption.label}
            onSelect={OnChange}
            isDisabled={!isValidVersion}
          >
            {options.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </SelectField>
        </FlexItem>
      </Flex>
      <Flex className="pf-v6-u-ml-sm pf-v6-u-mt-sm">
        <FlexItem>
          Reservation Id: {isCROnly ? <span style={{ color: '#B1380B' }}>*</span> : null}
        </FlexItem>
        <FlexItem>
          <TextField fieldId={crIdFieldId} isDisabled={!isCROnly} isRequired={isCROnly} />
        </FlexItem>
      </Flex>
      {!isValidVersion ? (
        <HelperText>
          <HelperTextItem>
            Capacity Reservation requires control plane version {requiredVersion} or above
          </HelperTextItem>
        </HelperText>
      ) : null}
    </FormGroup>
  ) : null;
};

export default CapacityReservationField;
