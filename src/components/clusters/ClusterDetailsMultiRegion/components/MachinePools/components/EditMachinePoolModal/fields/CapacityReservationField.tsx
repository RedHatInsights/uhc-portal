import React from 'react';
import { useField } from 'formik';
import semver from 'semver';

import {
  Flex,
  FlexItem,
  FormGroup,
  Grid,
  GridItem,
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

export type CapacityReservationPreference =
  | 'none'
  | 'open'
  | 'capacity-reservations-only'
  | undefined;

type CapacityReservationFieldProps = {
  cluster: ClusterFromSubscription;
  isEdit?: boolean;
};

const options = [
  { label: 'None', value: 'none' },
  { label: 'Open', value: 'open' },
  { label: 'CR only', value: 'capacity-reservations-only' },
];

const invalidVersionOption = { label: '', value: '' };

export const capacityReservationHint = (showList: boolean, showRosaLink: boolean) => (
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
              <strong>None</strong> to ensure these instances won’t use a reservation at all and
              will run as an On-Demand Instance
            </li>
            <li>
              <strong>Open</strong> to make use of an open reservation that has matching attributes.
              If capacity isn’t available, the instance runs as an On-Demand Instance
            </li>
            <li>
              <strong>CR only</strong> to run in a Capacity Reservation. A specific reservation can
              be targeted by providing a capacity reservation ID or make use of an open reservation
              if an ID is not specified. If capacity isn’t available, the instance will fail to
              launch.
            </li>
          </ul>
        </FlexItem>
      </>
    ) : null}
    <FlexItem>
      To learn more about Capacity Reservations, visit{' '}
      <ExternalLink href={links.AWS_CAPACITY_RESERVATION}>AWS Documentation</ExternalLink>
    </FlexItem>
    {showRosaLink ? (
      <FlexItem>
        To learn more about configuring capacity reservations, visit{' '}
        <ExternalLink href={links.ROSA_CAPACITY_RESERVATION_OVERVIEW}>
          ROSA Documentation
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

  const selectedOption = isValidVersion
    ? options.find((option) => option.value === capacityPreferenceField.value) || options[0]
    : invalidVersionOption;

  return canUseCapacityReservation ? (
    <FormGroup
      className="pf-v6-u-pb-2xl"
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
            ariaLabel="Reservation Preference"
          >
            {options.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </SelectField>
        </FlexItem>
      </Flex>
      {isCROnly ? (
        <Grid className="pf-v6-u-ml-sm pf-v6-u-mt-sm">
          <GridItem span={4}>
            <TextField fieldId={crIdFieldId} label="Reservation Id" trimOnBlur />
          </GridItem>
        </Grid>
      ) : null}
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
