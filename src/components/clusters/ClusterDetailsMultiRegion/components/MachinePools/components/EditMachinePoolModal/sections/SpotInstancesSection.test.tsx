import React from 'react';
import { Formik } from 'formik';

import { SPOT_CAPACITY_RESERVATION_CONFLICT_REASON } from '~/components/clusters/common/machinePools/constants';
import {
  SPOT_INTERRUPTION_MODE_ENHANCED_LABEL,
  SPOT_INTERRUPTION_MODE_SIMPLE_LABEL,
} from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import { render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import SpotInstancesSection from './SpotInstancesSection';

const mockHypershiftCluster = {
  aws: { termination_handler_queue_url: 'https://sqs.us-east-1.amazonaws.com/123/queue' },
} as ClusterFromSubscription;

const MockFormikWrapper = ({
  children,
  initialValues,
}: {
  children: React.ReactNode;
  initialValues: any;
}) => (
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    {children}
  </Formik>
);

const defaultValues = {
  useSpotInstances: false,
  spotInstanceType: 'onDemand',
  maxPrice: 0.01,
  capacityReservationPreference: 'none',
};

describe('<SpotInstancesSection>', () => {
  it('enables the "Use Amazon EC2 Spot Instance" checkbox when no capacity reservation is configured', () => {
    render(
      <MockFormikWrapper initialValues={defaultValues}>
        <SpotInstancesSection isEdit={false} isHypershift />
      </MockFormikWrapper>,
    );

    expect(screen.getByLabelText('Use Amazon EC2 Spot Instance')).toBeEnabled();
  });

  it.each(['open', 'capacity-reservations-only'])(
    'disables the "Use Amazon EC2 Spot Instance" checkbox when capacity reservation preference is "%s"',
    (capacityReservationPreference) => {
      render(
        <MockFormikWrapper initialValues={{ ...defaultValues, capacityReservationPreference }}>
          <SpotInstancesSection isEdit={false} isHypershift />
        </MockFormikWrapper>,
      );

      expect(screen.getByLabelText('Use Amazon EC2 Spot Instance')).toBeDisabled();
    },
  );

  it('does not disable the "Use Amazon EC2 Spot Instance" checkbox when capacity reservation preference is "none"', () => {
    render(
      <MockFormikWrapper
        initialValues={{ ...defaultValues, capacityReservationPreference: 'none' }}
      >
        <SpotInstancesSection isEdit={false} isHypershift />
      </MockFormikWrapper>,
    );

    expect(screen.getByLabelText('Use Amazon EC2 Spot Instance')).toBeEnabled();
  });

  it('shows a tooltip explaining the conflict when disabled due to a capacity reservation', async () => {
    const { user } = render(
      <MockFormikWrapper
        initialValues={{ ...defaultValues, capacityReservationPreference: 'open' }}
      >
        <SpotInstancesSection isEdit={false} isHypershift />
      </MockFormikWrapper>,
    );

    await user.hover(screen.getByLabelText('Use Amazon EC2 Spot Instance'));
    expect(await screen.findByText(SPOT_CAPACITY_RESERVATION_CONFLICT_REASON)).toBeInTheDocument();
  });

  it('still disables the checkbox for edit mode regardless of capacity reservation', () => {
    render(
      <MockFormikWrapper initialValues={defaultValues}>
        <SpotInstancesSection isEdit isHypershift />
      </MockFormikWrapper>,
    );

    expect(screen.getByLabelText('Use Amazon EC2 Spot Instance')).toBeDisabled();
  });

  it('shows the "cannot be edited" tooltip, not the capacity reservation conflict tooltip, when both apply', async () => {
    const { user } = render(
      <MockFormikWrapper
        initialValues={{ ...defaultValues, capacityReservationPreference: 'open' }}
      >
        <SpotInstancesSection isEdit isHypershift />
      </MockFormikWrapper>,
    );

    await user.hover(screen.getByLabelText('Use Amazon EC2 Spot Instance'));
    expect(
      await screen.findByText('This option cannot be edited from its original setting selection.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(SPOT_CAPACITY_RESERVATION_CONFLICT_REASON)).not.toBeInTheDocument();
  });

  it('shows Spot instances Enhanced for Hypershift when termination_handler_queue_url is set', () => {
    render(
      <MockFormikWrapper initialValues={{ ...defaultValues, useSpotInstances: true }}>
        <SpotInstancesSection isEdit={false} isHypershift cluster={mockHypershiftCluster} />
      </MockFormikWrapper>,
    );

    expect(screen.getByText('Spot interruption handling:')).toBeInTheDocument();
    expect(screen.getByTestId('spotInterruptionHandlingMode')).toHaveTextContent(
      SPOT_INTERRUPTION_MODE_ENHANCED_LABEL,
    );
  });

  it('shows Spot instances Simple for Hypershift when termination_handler_queue_url is not set', () => {
    render(
      <MockFormikWrapper initialValues={{ ...defaultValues, useSpotInstances: true }}>
        <SpotInstancesSection
          isEdit={false}
          isHypershift
          cluster={{ aws: {} } as ClusterFromSubscription}
        />
      </MockFormikWrapper>,
    );

    expect(screen.getByTestId('spotInterruptionHandlingMode')).toHaveTextContent(
      SPOT_INTERRUPTION_MODE_SIMPLE_LABEL,
    );
  });

  it('does not show spot interruption handling when Use Amazon EC2 Spot Instance is disabled', () => {
    render(
      <MockFormikWrapper initialValues={defaultValues}>
        <SpotInstancesSection isEdit={false} isHypershift cluster={mockHypershiftCluster} />
      </MockFormikWrapper>,
    );

    expect(screen.queryByText('Spot interruption handling:')).not.toBeInTheDocument();
  });

  it('does not show spot interruption handling for non-Hypershift clusters', () => {
    render(
      <MockFormikWrapper initialValues={{ ...defaultValues, useSpotInstances: true }}>
        <SpotInstancesSection isEdit={false} cluster={mockHypershiftCluster} />
      </MockFormikWrapper>,
    );

    expect(screen.queryByText('Spot interruption handling:')).not.toBeInTheDocument();
  });
});
