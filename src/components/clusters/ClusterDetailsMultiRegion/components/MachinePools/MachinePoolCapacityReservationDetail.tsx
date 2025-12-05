import React from 'react';

import { GridItem, Title } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';

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
        hint={
          <>
            ID of Capacity Reservation or Capacity Blocks for ML. Requires control plane version
            4.19.0 or above. Learn more about{' '}
            <ExternalLink href={links.AWS_CAPACITY_RESERVATION}>Capacity Reservations</ExternalLink>
          </>
        }
      />
    </Title>
    <GridItem className="capacity_reservation">
      Reservation Preference: {capacityReservationPreference || 'N/A'}
    </GridItem>
    <GridItem className="capacity_reservation">
      Reservation Id: {capacityReservationId || 'N/A'}
    </GridItem>
  </>
);

export default MachinePoolCapacityReservationDetail;
