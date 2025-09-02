import React from 'react';
import { Formik } from 'formik';

import { useAWSVPCFromCluster } from '~/components/clusters/common/useAWSVPCFromCluster';
import { FieldId } from '~/components/clusters/wizards/common';
import { render, screen } from '~/testUtils';
import { SecurityGroup } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import EditSecurityGroupsField from './EditSecurityGroupsField';

jest.mock('~/components/clusters/common/useAWSVPCFromCluster');

const useAWSVPCFromClusterMock = useAWSVPCFromCluster as jest.Mock;

describe('EditSecurityGroupsField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isLoading', () => {
    // Arrange
    useAWSVPCFromClusterMock.mockReturnValueOnce({ isLoading: true });

    // Act
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <EditSecurityGroupsField cluster={{} as ClusterFromSubscription} isReadOnly={false} />
      </Formik>,
    );

    // Assert
    expect(screen.getByText(/loading security groups/i)).toBeInTheDocument();
  });

  it('vpc undefined', async () => {
    // Arrange
    const refreshVPCMock = jest.fn();
    useAWSVPCFromClusterMock.mockReturnValueOnce({ refreshVPC: refreshVPCMock });

    // Act
    const { user } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <EditSecurityGroupsField cluster={{} as ClusterFromSubscription} isReadOnly={false} />
      </Formik>,
    );

    // Assert
    expect(screen.getByText(/please try refreshing the cluster's vpc\./i)).toBeInTheDocument();
    expect(refreshVPCMock).toHaveBeenCalledTimes(0);
    await user.click(
      screen.getByRole('button', {
        name: /refretch Cluster's VPC/i,
      }),
    );
    expect(refreshVPCMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['vpc aws_security_groups undefined', undefined],
    ['vpc aws_security_groups empty', []],
    // eslint-disable-next-line camelcase
  ])('%p', async (_title: string, aws_security_groups: SecurityGroup[] | undefined) => {
    // Arrange
    const refreshVPCMock = jest.fn();
    useAWSVPCFromClusterMock.mockReturnValueOnce({
      refreshVPC: refreshVPCMock,
      // eslint-disable-next-line camelcase
      clusterVpc: { aws_security_groups },
    });

    // Act
    const { user } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <EditSecurityGroupsField cluster={{} as ClusterFromSubscription} isReadOnly={false} />
      </Formik>,
    );

    // Assert
    expect(
      screen.getByText(/to add security groups, go to the of your aws console\./i),
    ).toBeInTheDocument();
    expect(refreshVPCMock).toHaveBeenCalledTimes(0);
    await user.click(
      screen.getByRole('button', {
        name: /refresh security groups/i,
      }),
    );
    expect(refreshVPCMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'it is not hypershift and lower version',
      { openshift_version: '4.10.0' } as ClusterFromSubscription,
      /to use security groups, your cluster must be version 4\.11\.0 or newer\./i,
    ],
    [
      'it is hypershift and lower version',
      { hypershift: { enabled: true }, openshift_version: '4.14.0' } as ClusterFromSubscription,
      /to use security groups, your cluster must be version 4\.15\.0 or newer\./i,
    ],
  ])(
    'it is incompatible due to: %p',
    async (
      _incompatibilityReason: string,
      cluster: ClusterFromSubscription,
      expectedIncompatibilityReason: RegExp,
    ) => {
      // Arrange
      const refreshVPCMock = jest.fn();
      useAWSVPCFromClusterMock.mockReturnValueOnce({
        refreshVPC: refreshVPCMock,
        clusterVpc: { aws_security_groups: [{}, {}] },
      });

      // Act
      const { user } = render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <EditSecurityGroupsField cluster={cluster} isReadOnly={false} />
        </Formik>,
      );

      // Assert
      expect(
        screen.getByRole('heading', {
          name: expectedIncompatibilityReason,
        }),
      ).toBeInTheDocument();
      expect(refreshVPCMock).toHaveBeenCalledTimes(0);
      await user.click(
        screen.getByRole('button', {
          name: /refresh security groups/i,
        }),
      );
      expect(refreshVPCMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    [
      'it is not hypershift and expected version',
      { openshift_version: '4.11.0' } as ClusterFromSubscription,
    ],
    [
      'it is hypershift and expected version',
      { hypershift: { enabled: true }, openshift_version: '4.15.0' } as ClusterFromSubscription,
    ],
  ])(
    'it is compatible: %p',
    async (_incompatibilityReason: string, cluster: ClusterFromSubscription) => {
      // Arrange
      const refreshVPCMock = jest.fn();
      useAWSVPCFromClusterMock.mockReturnValueOnce({
        refreshVPC: refreshVPCMock,
        clusterVpc: { aws_security_groups: [{}, {}] },
      });

      // Act
      const { user, container } = render(
        <Formik initialValues={{ [FieldId.SecurityGroupIds]: [] }} onSubmit={() => {}}>
          <EditSecurityGroupsField cluster={cluster} isReadOnly={false} />
        </Formik>,
      );

      // Assert
      expect(
        screen.getByRole('button', {
          name: /options menu/i,
        }),
      ).toBeInTheDocument();
      expect(refreshVPCMock).toHaveBeenCalledTimes(0);
      const refreshButton = container.querySelector('#refreshSecurityGroupsButton');
      expect(refreshButton).toBeInTheDocument();
      await user.click(refreshButton!);
      expect(refreshVPCMock).toHaveBeenCalledTimes(1);
    },
  );
});
