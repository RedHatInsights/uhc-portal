// Some components under Details have their own tests;
// this file tries to take a more "black box integration" approach.

import * as React from 'react';
import { Formik } from 'formik';

import { waitFor } from '@testing-library/react';

import { fulfilledProviders, multiRegions, noProviders } from '~/common/__tests__/regions.fixtures';
import { mockQuotaList } from '~/components/clusters/common/__tests__/quota.fixtures';
import {
  FieldId,
  initialValues,
  initialValuesRestrictedEnv,
} from '~/components/clusters/wizards/rosa/constants';
import ocpLifeCycleStatuses from '~/components/releases/__mocks__/ocpLifeCycleStatuses';
import {
  ALLOW_EUS_CHANNEL,
  FIPS_FOR_HYPERSHIFT,
  MAX_NODES_TOTAL_249,
  MULTIREGION_PREVIEW_ENABLED,
} from '~/queries/featureGates/featureConstants';
import { useFetchGetMultiRegionAvailableRegions } from '~/queries/RosaWizardQueries/useFetchGetMultiRegionAvailableRegions';
import clusterService from '~/services/clusterService';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';
import { mockRestrictedEnv, mockUseFeatureGate, render, screen, withState } from '~/testUtils';

import Details from './Details';

jest.mock('~/services/clusterService');
jest.mock('~/services/productLifeCycleService');

jest.mock('~/queries/RosaWizardQueries/useFetchGetMultiRegionAvailableRegions', () => ({
  useFetchGetMultiRegionAvailableRegions: jest.fn(),
}));

const version = { id: '4.14.0' };

describe('<Details />', () => {
  const defaultValues = {
    ...initialValues,
    [FieldId.Hypershift]: 'false',
    [FieldId.ClusterVersion]: version,
    [FieldId.Region]: 'eu-north-1',
    [FieldId.HasDomainPrefix]: true,
  };

  describe('Region dropdown', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (clusterService.getInstallableVersions as jest.Mock).mockResolvedValue({
        data: { items: [version] },
      });
      (clusterService.getMachineTypesByRegionARN as jest.Mock).mockResolvedValue({
        data: { items: [] },
      });
      (getOCPLifeCycleStatus as jest.Mock).mockResolvedValue(ocpLifeCycleStatuses);
    });

    it('displays a spinner while regions are loading', async () => {
      const notLoadedState = {
        cloudProviders: noProviders,
      };
      (clusterService.getCloudProviders as jest.Mock).mockReturnValue(
        // a promise that won't be resolved, so providers become pending but not fulfilled.
        new Promise(() => {}),
      );

      withState(notLoadedState).render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(await screen.findByText('Loading region list...')).toBeInTheDocument();
    });

    it('displays the available regions when they are loaded', async () => {
      const loadedState = {
        cloudProviders: fulfilledProviders,
      };

      withState(loadedState).render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(await screen.findByText('eu-west-0, Avalon')).toBeInTheDocument();
      expect(await screen.findByText('single-az-3, Antarctica')).toBeInTheDocument();
    });

    it('displays multi region dropdown and shows a spinner while fetching', async () => {
      mockUseFeatureGate([[MULTIREGION_PREVIEW_ENABLED, true]]);
      const mockedUseFetchGetMultiRegionAvailableRegions = useFetchGetMultiRegionAvailableRegions;

      (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
        data: undefined,
        error: undefined,
        isError: false,
        isFetching: true,
      });

      const newValues = {
        ...defaultValues,
        [FieldId.Hypershift]: 'true',
      };

      render(
        <Formik initialValues={newValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );
      expect(await screen.findByText('Loading region list...')).toBeInTheDocument();
    });

    it('displays the available multi regions when they are fetched', async () => {
      mockUseFeatureGate([[MULTIREGION_PREVIEW_ENABLED, true]]);
      const mockedUseFetchGetMultiRegionAvailableRegions = useFetchGetMultiRegionAvailableRegions;

      (mockedUseFetchGetMultiRegionAvailableRegions as jest.Mock).mockReturnValue({
        data: multiRegions,
        error: false,
        isFetching: false,
        isError: false,
        isSuccess: true,
      });

      const newValues = {
        ...defaultValues,
        [FieldId.Hypershift]: 'true',
      };

      render(
        <Formik initialValues={newValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );
      await waitFor(() => {
        expect(screen.queryByText('Loading region list...')).not.toBeInTheDocument();
      });

      expect(
        await screen.findByText('ap-southeast-1, Asia Pacific, Singapore'),
      ).toBeInTheDocument();
      expect(await screen.findByText('us-west-2, US West, Oregon')).toBeInTheDocument();
    });
  });

  describe('Domain prefix', () => {
    it('displays the field when has_domain_prefix is selected', async () => {
      render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(screen.queryByText('Domain prefix')).toBeInTheDocument();
    });

    it('is hidden when has_domain_prefix is false', async () => {
      const newValues = { ...defaultValues, [FieldId.HasDomainPrefix]: false };

      render(
        <Formik initialValues={newValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      expect(screen.queryByText('Domain prefix')).toBe(null);
    });
  });

  describe('Channel group dropdown', () => {
    const versionsWithMultipleChannels = [
      {
        id: 'openshift-v4.12.1',
        raw_id: '4.12.1',
        channel_group: 'stable',
        rosa_enabled: true,
        hosted_control_plane_enabled: true,
      },
      {
        id: 'openshift-v4.12.0-eus',
        raw_id: '4.12.0',
        channel_group: 'eus',
        rosa_enabled: true,
        hosted_control_plane_enabled: true,
      },
      {
        id: 'openshift-v4.11.5-nightly',
        raw_id: '4.11.5',
        channel_group: 'nightly',
        rosa_enabled: true,
        hosted_control_plane_enabled: true,
      },
    ];

    beforeEach(() => {
      jest.resetAllMocks();
      (clusterService.getInstallableVersions as jest.Mock).mockResolvedValue({
        data: { items: versionsWithMultipleChannels },
      });
      (clusterService.getMachineTypesByRegionARN as jest.Mock).mockResolvedValue({
        data: { items: [] },
      });
      (getOCPLifeCycleStatus as jest.Mock).mockResolvedValue(ocpLifeCycleStatuses);
    });

    it('displays channel group dropdown when ALLOW_EUS_CHANNEL feature gate is enabled', async () => {
      // Arrange
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
      const loadedState = {
        cloudProviders: fulfilledProviders,
        clusters: {
          clusterVersions: {
            fulfilled: true,
            versions: versionsWithMultipleChannels,
            error: false,
            pending: false,
          },
        },
      };

      // Act
      withState(loadedState).render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      // Assert
      expect(await screen.findByText('Channel group')).toBeInTheDocument();
    });

    it('hides channel group dropdown when ALLOW_EUS_CHANNEL feature gate is disabled', async () => {
      // Arrange
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, false]]);
      const loadedState = {
        cloudProviders: fulfilledProviders,
        clusters: {
          clusterVersions: {
            fulfilled: true,
            versions: versionsWithMultipleChannels,
            error: false,
            pending: false,
          },
        },
      };

      // Act
      withState(loadedState).render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Channel group')).not.toBeInTheDocument();
      });
    });

    it('displays channel group with EUS and stable versions', async () => {
      // Arrange
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
      const stableVersion = versionsWithMultipleChannels[0];
      const eusVersion = {
        ...versionsWithMultipleChannels[1],
        raw_id: '4.12.1', // Same version number as stable
      };
      const versionsWithSameRawId = [stableVersion, eusVersion];

      const loadedState = {
        cloudProviders: fulfilledProviders,
        clusters: {
          clusterVersions: {
            fulfilled: true,
            versions: versionsWithSameRawId,
            error: false,
            pending: false,
          },
        },
      };

      const initialVals = {
        ...defaultValues,
        [FieldId.ChannelGroup]: 'stable',
        [FieldId.ClusterVersion]: stableVersion,
      };

      // Act
      withState(loadedState).render(
        <Formik initialValues={initialVals} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Channel group')).toBeInTheDocument();
      });
    });

    it('displays channel group with nightly versions', async () => {
      // Arrange
      mockUseFeatureGate([[ALLOW_EUS_CHANNEL, true]]);
      const stableVersion = versionsWithMultipleChannels[0];

      const loadedState = {
        cloudProviders: fulfilledProviders,
        clusters: {
          clusterVersions: {
            fulfilled: true,
            versions: versionsWithMultipleChannels,
            error: false,
            pending: false,
          },
        },
      };

      const initialVals = {
        ...defaultValues,
        [FieldId.ChannelGroup]: 'nightly',
        [FieldId.ClusterVersion]: stableVersion,
      };

      // Act
      withState(loadedState).render(
        <Formik initialValues={initialVals} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      // Assert - the channel group dropdown should be visible
      await waitFor(() => {
        expect(screen.getByText('Channel group')).toBeInTheDocument();
      });
    });
  });

  describe('Max nodes total reset behavior', () => {
    const versions = [
      {
        id: 'openshift-v4.12.1',
        raw_id: '4.12.1',
        rosa_enabled: true,
      },
      {
        id: 'openshift-v4.18.1',
        raw_id: '4.18.1',
        rosa_enabled: true,
      },
    ];

    const stableVersion = versions[0];

    const loadedState = {
      cloudProviders: fulfilledProviders,
      clusters: {
        clusterVersions: {
          fulfilled: true,
          versions,
          error: false,
          pending: false,
        },
      },
      userProfile: {
        organization: {
          fulfilled: true,
          quotaList: mockQuotaList,
        },
      },
    };

    const formValues = {
      ...defaultValues,
      [FieldId.ClusterVersion]: stableVersion,
      [FieldId.RosaMaxOsVersion]: '4.99', // Set a high max version to allow all test versions
      // Change max-nodes-total to a non-default value
      'cluster_autoscaling.resource_limits.max_nodes_total': 33,
    };

    beforeEach(() => {
      jest.resetAllMocks();
      mockUseFeatureGate([[MAX_NODES_TOTAL_249, true]]);
      (clusterService.getInstallableVersions as jest.Mock).mockResolvedValue({
        data: { items: [] },
      });
      (clusterService.getMachineTypesByRegionARN as jest.Mock).mockResolvedValue({
        data: { items: [] },
      });
      (getOCPLifeCycleStatus as jest.Mock).mockResolvedValue(ocpLifeCycleStatuses);
    });

    it('resets max-nodes-total to default when changing availability zone', async () => {
      // Arrange
      const handleSubmit = jest.fn();

      (clusterService.getMachineTypesByRegionARN as jest.Mock).mockResolvedValue({
        data: {
          items: [
            {
              instance_type: 'm5.large',
              availability_zones: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
            },
            {
              instance_type: 'm5.xlarge',
              availability_zones: ['us-east-1a'],
            },
          ],
        },
      });

      const { user } = withState(loadedState).render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          {({ values }) => (
            <div>
              <Details />
              <button type="button" onClick={() => handleSubmit(values)}>
                submit
              </button>
            </div>
          )}
        </Formik>,
      );

      // Wait for the component to be fully rendered
      await waitFor(() => {
        expect(screen.getByRole('radio', { name: /Multi-zone/i })).toBeInTheDocument();
      });

      // Act
      // Switch availability zone
      const multiAzInput = screen.getByRole('radio', { name: /Multi-zone/i });
      await user.click(multiAzInput);

      // Wait for form state to update after the radio button change
      await waitFor(
        () => {
          expect(multiAzInput).toBeChecked();
        },
        { timeout: 1000 },
      );

      // Submit form
      await user.click(screen.getByRole('button', { name: 'submit' }));

      // Assert
      // For version 4.12.1 with multi-az: 180 (max worker nodes) + 3 (master) + 3 (infra) = 186
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      const submittedValues = handleSubmit.mock.calls[0][0];
      // Verify max-nodes-total has been reset to default
      expect(submittedValues.cluster_autoscaling?.resource_limits?.max_nodes_total).toBe(186);
    });

    it('resets max-nodes-total to default when changing a version', async () => {
      // Arrange
      const handleSubmit = jest.fn();

      const { user } = withState(loadedState).render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          {({ values }) => (
            <div>
              <Details />
              <button type="button" onClick={() => handleSubmit(values)}>
                submit
              </button>
            </div>
          )}
        </Formik>,
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Options menu' })).toBeInTheDocument();
      });

      // Act
      // Switch version
      const versionButton = screen.getByRole('button', { name: 'Options menu' });
      await user.click(versionButton);

      // Wait for the dropdown to open and find the option
      await waitFor(() => {
        expect(screen.getByRole('option', { name: '4.18.1' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: '4.18.1' }));

      // Submit form
      await user.click(screen.getByRole('button', { name: 'submit' }));

      // Assert
      // For version 4.18.1 with single-az (default): 249 (max worker nodes) + 3 (master) + 2 (infra) = 254
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      const submittedValues = handleSubmit.mock.calls[0][0];
      // Verify max-nodes-total has been reset to default
      expect(submittedValues.cluster_autoscaling?.resource_limits?.max_nodes_total).toBe(254);
    });
  });

  describe('Advanced Encryption', () => {
    it('shows FIPS cryptography field by default', async () => {
      const { user } = render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      const advancedEncryptionExpand = screen.getByRole('button', {
        name: /Advanced encryption/i,
      });
      await user.click(advancedEncryptionExpand);
      const fipsCheckbox = screen.getByRole('checkbox', { name: /Enable FIPS cryptography/i });

      expect(fipsCheckbox).toBeInTheDocument();
    });

    it('shows FIPS cryptography field when hypershift is selected, and the feature-gate is enabled', async () => {
      mockUseFeatureGate([[FIPS_FOR_HYPERSHIFT, true]]);

      const formValues = {
        ...defaultValues,
        [FieldId.Hypershift]: 'true',
      };
      const { user } = render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      const advancedEncryptionExpand = screen.getByRole('button', {
        name: /Advanced encryption/i,
      });
      await user.click(advancedEncryptionExpand);
      const fipsCheckbox = screen.getByRole('checkbox', { name: /Enable FIPS cryptography/i });

      expect(fipsCheckbox).toBeInTheDocument();
    });

    it('does not show FIPS cryptography field when hypershift is selected, and the feature-gate is not enabled', async () => {
      mockUseFeatureGate([[FIPS_FOR_HYPERSHIFT, false]]);

      const formValues = {
        ...defaultValues,
        [FieldId.Hypershift]: 'true',
      };
      const { user } = render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      const advancedEncryptionExpand = screen.getByRole('button', {
        name: /Advanced encryption/i,
      });
      await user.click(advancedEncryptionExpand);
      const fipsCheckbox = screen.queryByRole('checkbox', { name: /Enable FIPS cryptography/i });

      expect(fipsCheckbox).not.toBeInTheDocument();
    });

    it.each([
      ['ROSA classic', defaultValues, 'Enable additional etcd encryption'],
      [
        'ROSA HCP',
        {
          ...defaultValues,
          [FieldId.Hypershift]: 'true',
        },
        'Encrypt etcd with a custom KMS key',
      ],
    ])(
      'toggles state of dependent checkboxes correctly for %s',
      async (msg, formValues, etcdEncryptionLabel) => {
        mockUseFeatureGate([[FIPS_FOR_HYPERSHIFT, true]]);

        const { user } = render(
          <Formik initialValues={formValues} onSubmit={() => {}}>
            <Details />
          </Formik>,
        );

        const advancedEncryptionExpand = screen.getByRole('button', {
          name: /Advanced encryption/i,
        });
        await user.click(advancedEncryptionExpand);

        const fipsCheckbox = screen.getByRole('checkbox', { name: /Enable FIPS cryptography/i });
        const etcdCheckbox = screen.getByRole('checkbox', { name: etcdEncryptionLabel });

        // FIPS and etcd should be initially unchecked
        expect(fipsCheckbox).not.toBeChecked();
        expect(etcdCheckbox).not.toBeChecked();

        // Check FIPS
        await user.click(fipsCheckbox!);
        // Etcd should also be automatically checked and disabled
        expect(fipsCheckbox).toBeChecked();
        expect(etcdCheckbox).toBeChecked();
        expect(etcdCheckbox).toBeDisabled();

        // Uncheck FIPS
        await user.click(fipsCheckbox!);
        // Etcd should still be checked but no longer disabled
        expect(fipsCheckbox).not.toBeChecked();
        expect(etcdCheckbox).toBeChecked();
        expect(etcdCheckbox).not.toBeDisabled();

        // Can independently uncheck/check etcd without affecting FIPS
        // Check etcd
        await user.click(etcdCheckbox!);
        expect(fipsCheckbox).not.toBeChecked();
        expect(etcdCheckbox).not.toBeChecked();

        // Check FIPS once more
        await user.click(fipsCheckbox!);
        // Etcd should also be automatically checked and disabled
        expect(fipsCheckbox).toBeChecked();
        expect(etcdCheckbox).toBeChecked();
        expect(etcdCheckbox).toBeDisabled();
      },
    );

    it('toggles state of dependent checkboxes correctly in restricted env', async () => {
      // simulate restricted env
      mockRestrictedEnv(true);

      const defaultValues = {
        ...initialValuesRestrictedEnv,
      };
      const { user } = render(
        <Formik initialValues={defaultValues} onSubmit={() => {}}>
          <Details />
        </Formik>,
      );

      const advancedEncryptionExpand = screen.getByRole('button', { name: /Advanced encryption/i });
      await user.click(advancedEncryptionExpand);

      const fipsCheckbox = screen.getByRole('checkbox', { name: /Enable FIPS cryptography/i });
      const etcdCheckbox = screen.getByRole('checkbox', {
        name: /Enable additional etcd encryption/i,
      });

      // FIPS and etcd should be initially checked and disabled
      expect(fipsCheckbox).toBeChecked();
      expect(fipsCheckbox).toBeDisabled();
      expect(etcdCheckbox).toBeChecked();
      expect(etcdCheckbox).toBeDisabled();
    });
  });
});
