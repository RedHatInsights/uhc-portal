import React from 'react';

import { GridItem, Title } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

import { capacityReservationHint } from './components/EditMachinePoolModal/fields/CapacityReservationField';
import { getCapacityPreferenceLabel } from './machinePoolsHelper';

const MachinePoolCapacityReservationDetail = ({
  capacityReservationId,
  capacityReservationPreference,
}: {
  capacityReservationId: string | undefined;
  capacityReservationPreference: string | undefined;
}) => (
  <>
    <Title headingLevel="h4" className="pf-v6-u-mb-sm pf-v6-u-mt-lg">
      Capacity Reservation{' '}
      <PopoverHint
        buttonAriaLabel="Capacity reservation information"
        hint={capacityReservationHint(false, false)}
      />
    </Title>
    <GridItem className="capacity_reservation">
      Reservation Preference:{' '}
      {getCapacityPreferenceLabel(capacityReservationPreference, capacityReservationId)}
    </GridItem>
    <GridItem className="capacity_reservation">
      Reservation Id: {capacityReservationId || 'N/A'}
    </GridItem>
  </>
);
export default MachinePoolCapacityReservationDetail;
