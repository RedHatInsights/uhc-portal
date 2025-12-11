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
import { CAPACITY_RESERVATION_MIN_VERSION as requiredVersion } from '~/components/clusters/common/machinePools/constants';
import ExternalLink from '~/components/common/ExternalLink';
import TextField from '~/components/common/formik/TextField';
import PopoverHint from '~/components/common/PopoverHint';
import useFormikOnChange from '~/hooks/useFormikOnChange';
import { CAPACITY_RESERVATION_ID_FIELD } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { ClusterFromSubscription } from '~/types/types';

import SelectField from './SelectField';

import './CapacityReservationField.scss';

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

export const capacityReservationHint = (showList: boolean, showPreferenceLink: boolean) => (
  <Flex>
    <FlexItem>
      Capacity Reservations allow you to reserve compute capacity for Amazon EC2 instances. Requires
      control plane version {requiredVersion} or above.
    </FlexItem>
    {showList ? (
      <>
        <FlexItem>Available options are:</FlexItem>
        <FlexItem className="pf-v6-u-pl-sm">
          <ul className="preference-list">
            <li>
              <strong>None</strong> to ensure these instances won’t use a reservation at all
            </li>
            <li>
              <strong>Open</strong> to make use of an open reservation if applicable
            </li>
            <li>
              <strong>CR only</strong> and a capacity reservation ID to target a specific
              reservation
            </li>
          </ul>
        </FlexItem>
      </>
    ) : null}
    <FlexItem>
      Learn more about{' '}
      <ExternalLink href={links.AWS_CAPACITY_RESERVATION}>Capacity Reservations</ExternalLink>
    </FlexItem>
    {showPreferenceLink ? (
      <FlexItem>
        Learn more about{' '}
        <ExternalLink href={links.AWS_CAPACITY_RESERVATION_PREFERENCE}>
          Capacity Reservation Preferences
        </ExternalLink>
      </FlexItem>
    ) : null}
  </Flex>
);

const CapacityReservationField = ({ cluster, isEdit }: CapacityReservationFieldProps) => {
  const isCapacityReservationEnabled = useFeatureGate(CAPACITY_RESERVATION_ID_FIELD);
  const capacityPreferenceField = useField(crPreferenceFieldId)[0];
  const [, , helpers] = useField(crIdFieldId);
  const { setValue } = helpers;
  const isCROnly = capacityPreferenceField.value === 'capacity-reservations-only';
  const clusterVersion = cluster?.openshift_version || cluster?.version?.raw_id || '';

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
          hint={capacityReservationHint(true, true)}
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
          Reservation Id: {isCROnly ? <span className="reservation-id-span">*</span> : null}
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
