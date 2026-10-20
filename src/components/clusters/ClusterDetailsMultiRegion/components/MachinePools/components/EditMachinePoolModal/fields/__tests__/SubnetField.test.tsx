import React from 'react';
import { Formik } from 'formik';

import { useAWSVPCFromCluster } from '~/components/clusters/common/useAWSVPCFromCluster';
import { render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import SubnetField from '../SubnetField';

jest.mock('~/components/clusters/common/useAWSVPCFromCluster');

const useAWSVPCFromClusterMock = useAWSVPCFromCluster as jest.Mock;

const renderSubnetField = (cluster: Partial<ClusterFromSubscription> = {}) =>
  render(
    <Formik initialValues={{ privateSubnetId: undefined }} onSubmit={() => {}}>
      <SubnetField cluster={cluster as ClusterFromSubscription} />
    </Formik>,
  );

describe('<SubnetField />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading spinner while the VPC is being fetched', () => {
    // Arrange
    useAWSVPCFromClusterMock.mockReturnValueOnce({ isLoading: true });

    // Act
    renderSubnetField();

    // Assert — PF Spinner renders children as screen-reader-only text; assert by
    // the absence of both the error alert and the subnet selector instead.
    expect(
      screen.queryByRole('heading', { name: /failed to load machine pool vpc\./i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows the real API error reason when the VPC fetch fails with one', () => {
    // Arrange — this is the core Fix 1 regression guard: errorReason returned by the
    // hook must reach the alert. Before the fix, SubnetField dropped it and the alert
    // always fell back to the generic "Please try refreshing" message.
    const errorReason =
      "An error occurred while trying to create an AWS client: Organization '' is not authorized to access AWS Account ''. An administrator must run first 'rosa create ocm-role', then try again.";
    useAWSVPCFromClusterMock.mockReturnValueOnce({
      isLoading: false,
      hasError: true,
      errorReason,
      refreshVPC: jest.fn(),
    });

    // Act
    renderSubnetField();

    // Assert
    expect(screen.getByText(errorReason)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /failed to load machine pool vpc\./i }),
    ).toBeInTheDocument();
  });

  it('falls back to the generic message when the VPC fetch fails without an error reason', () => {
    // Arrange
    useAWSVPCFromClusterMock.mockReturnValueOnce({
      isLoading: false,
      hasError: true,
      refreshVPC: jest.fn(),
    });

    // Act
    renderSubnetField();

    // Assert
    expect(screen.getByText(/please try refreshing the cluster's vpc\./i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /failed to load machine pool vpc\./i }),
    ).toBeInTheDocument();
  });

  it('shows the VPC error alert when clusterVpc is undefined even without an explicit error flag', () => {
    // Arrange
    useAWSVPCFromClusterMock.mockReturnValueOnce({
      isLoading: false,
      hasError: false,
      clusterVpc: undefined,
      refreshVPC: jest.fn(),
    });

    // Act
    renderSubnetField();

    // Assert
    expect(
      screen.getByRole('heading', { name: /failed to load machine pool vpc\./i }),
    ).toBeInTheDocument();
  });
});
