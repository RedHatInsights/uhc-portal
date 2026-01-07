import React from 'react';
import { Formik } from 'formik';

import { CAPACITY_RESERVATION_ID_FIELD } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import CapacityReservationField from '../CapacityReservationField';

const MockFormikWrapper = ({
  children,
  initialValues = {
    capacityReservationId: '',
    capacityReservationPreference: 'none',
  },
}: {
  children: React.ReactNode;
  initialValues?: any;
}) => (
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    {children}
  </Formik>
);
const mockHypershiftCluster: ClusterFromSubscription = {
  id: 'test-cluster',
  cloud_provider: { id: 'aws' },
  product: { id: 'ROSA' },
  hypershift: { enabled: true },
  version: { raw_id: '4.20.0' },
} as ClusterFromSubscription;

describe('<CapacityReservationField>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders for hypershift clusters', () => {
    mockUseFeatureGate([[CAPACITY_RESERVATION_ID_FIELD, true]]);
    render(
      <MockFormikWrapper>
        <CapacityReservationField cluster={mockHypershiftCluster} isEdit={false} />
      </MockFormikWrapper>,
    );
    expect(screen.getByText('Capacity Reservation')).toBeInTheDocument();
    expect(screen.getByText('Reservation Preference:')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('hides Reservation Id field when preference is not "CR only"', () => {
    mockUseFeatureGate([[CAPACITY_RESERVATION_ID_FIELD, true]]);
    render(
      <MockFormikWrapper
        initialValues={{
          capacityReservationId: '',
          capacityReservationPreference: 'none',
        }}
      >
        <CapacityReservationField cluster={mockHypershiftCluster} isEdit={false} />
      </MockFormikWrapper>,
    );
    expect(screen.queryByText('Reservation Id')).not.toBeInTheDocument();
  });

  it('shows Reservation Id field when preference is "CR only"', () => {
    mockUseFeatureGate([[CAPACITY_RESERVATION_ID_FIELD, true]]);
    render(
      <MockFormikWrapper
        initialValues={{
          capacityReservationId: '',
          capacityReservationPreference: 'capacity-reservations-only',
        }}
      >
        <CapacityReservationField cluster={mockHypershiftCluster} isEdit={false} />
      </MockFormikWrapper>,
    );
    expect(screen.getByText('Reservation Id')).toBeInTheDocument();
  });

  it('shows helper text for invalid cluster version', () => {
    mockUseFeatureGate([[CAPACITY_RESERVATION_ID_FIELD, true]]);
    render(
      <MockFormikWrapper>
        <CapacityReservationField
          cluster={{ ...mockHypershiftCluster, version: { raw_id: '4.18.0' } }}
          isEdit={false}
        />
      </MockFormikWrapper>,
    );
    expect(screen.getByText('Capacity Reservation')).toBeInTheDocument();

    expect(
      screen.getByText('Capacity Reservation requires control plane version 4.19.0 or above'),
    ).toBeInTheDocument();
    expect(screen.getByText('Reservation Preference:')).toBeInTheDocument();
  });

  it('is not displayed when editing machine pool', () => {
    mockUseFeatureGate([[CAPACITY_RESERVATION_ID_FIELD, true]]);
    render(
      <MockFormikWrapper>
        <CapacityReservationField cluster={mockHypershiftCluster} isEdit />
      </MockFormikWrapper>,
    );
    expect(screen.queryByText('Capacity Reservation')).not.toBeInTheDocument();
  });
});
