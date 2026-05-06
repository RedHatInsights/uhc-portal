import React from 'react';
import { Formik } from 'formik';

import * as useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import AutoscalingField from '../AutoscalingField';

const useCanClusterAutoscaleMock = jest.spyOn(useCanClusterAutoscale, 'default');

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
  initialAutoscaling = false,
}: {
  children: React.ReactNode;
  initialAutoscaling?: boolean;
}) => (
  <Formik initialValues={{ autoscaling: initialAutoscaling }} onSubmit={jest.fn()}>
    {children}
  </Formik>
);

describe('<AutoscalingField />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when canAutoScale is false', () => {
    useCanClusterAutoscaleMock.mockReturnValue(false);

    const { container } = render(
      <FormikWrapper>
        <AutoscalingField cluster={nonHypershiftCluster} />
      </FormikWrapper>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the checkbox when canAutoScale is true', () => {
    useCanClusterAutoscaleMock.mockReturnValue(true);

    render(
      <FormikWrapper>
        <AutoscalingField cluster={nonHypershiftCluster} />
      </FormikWrapper>,
    );

    expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).toBeInTheDocument();
  });

  it('renders the "Scaling" form group label', () => {
    useCanClusterAutoscaleMock.mockReturnValue(true);

    render(
      <FormikWrapper>
        <AutoscalingField cluster={nonHypershiftCluster} />
      </FormikWrapper>,
    );

    expect(screen.getByText('Scaling')).toBeInTheDocument();
  });

  it('shows the checkbox as checked when autoscaling is enabled', () => {
    useCanClusterAutoscaleMock.mockReturnValue(true);

    render(
      <FormikWrapper initialAutoscaling>
        <AutoscalingField cluster={nonHypershiftCluster} />
      </FormikWrapper>,
    );

    expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).toBeChecked();
  });

  it('shows the checkbox as unchecked when autoscaling is disabled', () => {
    useCanClusterAutoscaleMock.mockReturnValue(true);

    render(
      <FormikWrapper initialAutoscaling={false}>
        <AutoscalingField cluster={nonHypershiftCluster} />
      </FormikWrapper>,
    );

    expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).not.toBeChecked();
  });

  it('toggles the checkbox when clicked', async () => {
    useCanClusterAutoscaleMock.mockReturnValue(true);

    const { user } = render(
      <FormikWrapper initialAutoscaling={false}>
        <AutoscalingField cluster={nonHypershiftCluster} />
      </FormikWrapper>,
    );

    const checkbox = screen.getByRole('checkbox', { name: /enable autoscaling/i });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  describe('isDisabled behavior', () => {
    it('disables the checkbox when cluster is hypershift, autoscaling is off, and isMaxReached is true', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling={false}>
          <AutoscalingField cluster={hypershiftCluster} isMaxReached />
        </FormikWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).toBeDisabled();
    });

    it('shows the warning alert when the checkbox is disabled', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling={false}>
          <AutoscalingField cluster={hypershiftCluster} isMaxReached />
        </FormikWrapper>,
      );

      expect(screen.getByText('Maximum nodes limit has been reached.')).toBeInTheDocument();
    });

    it('does not disable the checkbox when autoscaling is already enabled', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling>
          <AutoscalingField cluster={hypershiftCluster} isMaxReached />
        </FormikWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).not.toBeDisabled();
    });

    it('does not show the warning alert when autoscaling is already enabled', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling>
          <AutoscalingField cluster={hypershiftCluster} isMaxReached />
        </FormikWrapper>,
      );

      expect(screen.queryByText('Maximum nodes limit has been reached.')).not.toBeInTheDocument();
    });

    it('does not disable the checkbox when cluster is not hypershift', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling={false}>
          <AutoscalingField cluster={nonHypershiftCluster} isMaxReached />
        </FormikWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).not.toBeDisabled();
    });

    it('does not show the warning alert when cluster is not hypershift', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling={false}>
          <AutoscalingField cluster={nonHypershiftCluster} isMaxReached />
        </FormikWrapper>,
      );

      expect(screen.queryByText('Maximum nodes limit has been reached.')).not.toBeInTheDocument();
    });

    it('does not disable the checkbox when isMaxReached is false', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling={false}>
          <AutoscalingField cluster={hypershiftCluster} isMaxReached={false} />
        </FormikWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).not.toBeDisabled();
    });

    it('does not show the warning alert when isMaxReached is false', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling={false}>
          <AutoscalingField cluster={hypershiftCluster} isMaxReached={false} />
        </FormikWrapper>,
      );

      expect(screen.queryByText('Maximum nodes limit has been reached.')).not.toBeInTheDocument();
    });

    it('does not disable the checkbox when isMaxReached is undefined', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper initialAutoscaling={false}>
          <AutoscalingField cluster={hypershiftCluster} />
        </FormikWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /enable autoscaling/i })).not.toBeDisabled();
    });
  });

  describe('popover hint', () => {
    it('shows the autoscaling popover hint button', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);

      render(
        <FormikWrapper>
          <AutoscalingField cluster={nonHypershiftCluster} />
        </FormikWrapper>,
      );

      expect(screen.getByLabelText('More information about autoscaling')).toBeInTheDocument();
    });
  });
});
