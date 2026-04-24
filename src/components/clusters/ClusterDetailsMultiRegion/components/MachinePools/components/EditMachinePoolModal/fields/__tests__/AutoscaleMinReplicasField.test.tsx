import React from 'react';
import { Formik } from 'formik';

import { render, screen, waitFor } from '~/testUtils';
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
    it('sets value to maxNodes on mount for new hypershift machine pool when maxNodes < 2', async () => {
      render(
        <FormikWrapper initialAutoscaleMin={2}>
          <AutoscaleMinReplicasField
            cluster={hypershiftCluster}
            minNodes={0}
            maxNodes={1}
            isHypershift
          />
        </FormikWrapper>,
      );

      await waitFor(() => {
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(1);
      });
    });

    it('sets value to 0 on mount when maxNodes is 0', async () => {
      render(
        <FormikWrapper initialAutoscaleMin={2}>
          <AutoscaleMinReplicasField
            cluster={hypershiftCluster}
            minNodes={0}
            maxNodes={0}
            isHypershift
          />
        </FormikWrapper>,
      );

      await waitFor(() => {
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(0);
      });
    });

    it('does not override value when isEdit is true', () => {
      render(
        <FormikWrapper initialAutoscaleMin={2}>
          <AutoscaleMinReplicasField
            cluster={hypershiftCluster}
            minNodes={0}
            maxNodes={1}
            isEdit
            isHypershift
          />
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
          <AutoscaleMinReplicasField
            cluster={hypershiftCluster}
            minNodes={0}
            maxNodes={5}
            isHypershift
          />
        </FormikWrapper>,
      );

      expect(screen.getByRole('spinbutton')).toHaveValue(2);
    });
  });
});
