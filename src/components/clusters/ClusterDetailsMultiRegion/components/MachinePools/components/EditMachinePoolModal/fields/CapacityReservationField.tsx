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
import getClusterVersion from '~/components/clusters/common/getClusterVersion';
import ExternalLink from '~/components/common/ExternalLink';
import TextField from '~/components/common/formik/TextField';
import PopoverHint from '~/components/common/PopoverHint';
import useFormikOnChange from '~/hooks/useFormikOnChange';
import { CAPACITY_RESERVATION_ID_FIELD } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { ClusterFromSubscription } from '~/types/types';

import SelectField from './SelectField';

const crIdFieldId = 'capacityReservationId';
const crPreferenceFieldId = 'capacityPreference';

export type CapacityPreference = 'none' | 'open' | 'capacity-reservations-only';

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

  const clusterVersion = getClusterVersion(cluster);
  const requiredVersion = '4.19.0';
  const isValidVersion = semver.gte(clusterVersion, requiredVersion);

  const canUseCapacityReservation =
    isHypershiftCluster(cluster) && isCapacityReservationEnabled && !isEdit;

  const onChange = useFormikOnChange(crPreferenceFieldId);
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
            onSelect={onChange}
            isDisabled={!isValidVersion}
          >
            {options.map((option) => (
              <SelectOption value={option.value}>{option.label}</SelectOption>
            ))}
          </SelectField>
        </FlexItem>
      </Flex>
      <Flex className="pf-v6-u-ml-sm pf-v6-u-mt-sm">
        <FlexItem>Reservation Id: </FlexItem>
        <FlexItem>
          <TextField
            fieldId={crIdFieldId}
            isDisabled={capacityPreferenceField.value !== 'capacity-reservations-only'}
          />
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
