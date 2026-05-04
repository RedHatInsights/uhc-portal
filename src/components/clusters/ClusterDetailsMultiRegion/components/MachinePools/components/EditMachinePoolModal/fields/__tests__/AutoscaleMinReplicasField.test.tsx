import React from 'react';
import { Formik } from 'formik';

import { render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import AutoscaleMinReplicasField from '../AutoscaleMinReplicasField';

const hypershiftCluster: ClusterFromSubscription = {
  product: { id: 'ROSA' },
  cloud_provider: { id: 'aws' },
  hypershift: { enabled: true },
} as ClusterFromSubscription;

const nonHypershiftCluster: ClusterFromSubscription = {
  product: { id: 'osd' },
  multi_az: false,
} as ClusterFromSubscription;

const FormikWrapper = ({
  children,
  initialAutoscaleMin = 2,
}: {
  children: React.ReactNode;
  initialAutoscaleMin?: number;
}) => (
  <Formik initialValues={{ autoscaleMin: initialAutoscaleMin }} onSubmit={jest.fn()}>
    {children}
  </Formik>
);

describe('<AutoscaleMinReplicasField />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization when maxNodes < 2', () => {
    it('does not override value when isEdit is true', () => {
      render(
        <FormikWrapper initialAutoscaleMin={2}>
          <AutoscaleMinReplicasField cluster={hypershiftCluster} minNodes={0} maxNodes={1} />
        </FormikWrapper>,
      );

      expect(screen.getByRole('spinbutton')).toHaveValue(2);
    });

    it('does not override value when cluster is not hypershift', () => {
      render(
        <FormikWrapper initialAutoscaleMin={2}>
          <AutoscaleMinReplicasField cluster={nonHypershiftCluster} minNodes={0} maxNodes={1} />
        </FormikWrapper>,
      );

      expect(screen.getByRole('spinbutton')).toHaveValue(2);
    });

    it('does not override value when maxNodes >= 2', () => {
      render(
        <FormikWrapper initialAutoscaleMin={2}>
          <AutoscaleMinReplicasField cluster={hypershiftCluster} minNodes={0} maxNodes={5} />
        </FormikWrapper>,
      );

      expect(screen.getByRole('spinbutton')).toHaveValue(2);
    });
  });
});
