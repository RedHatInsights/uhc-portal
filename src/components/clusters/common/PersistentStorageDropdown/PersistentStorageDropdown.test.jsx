import React from 'react';

import * as useFetchStorageQuotaValues from '~/queries/ClusterActionsQueries/useFetchStorageQuotaValues';
import * as useFetchOrganizationAndQuota from '~/queries/common/useFetchOrganizationAndQuota';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import fixtures from '../../ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';

import PersistentStorageDropdown from './PersistentStorageDropdown';

const mockedUseFetchOrganizationAndQuota = jest.spyOn(
  useFetchOrganizationAndQuota,
  'useFetchOrganizationAndQuota',
);
const mockedQuotaListReturnedData = {
  items: [
    {
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'pv.storage|gp2',
      allowed: 27000,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'gp2',
          resource_type: 'pv.storage',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'ANY',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'gp2',
          resource_type: 'pv.storage',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ANY',
          billing_model: 'standard',
          cost: 0,
        },
      ],
    },
    {
      allowed: 12,
      consumed: 4,
      quota_id: 'network.loadbalancer|network',
      related_resources: [
        {
          availability_zone_type: 'any',
          billing_model: 'standard',
          byoc: 'rhinfra',
          cloud_provider: 'any',
          cost: 1,
          product: 'ANY',
          resource_name: 'network',
          resource_type: 'network.loadbalancer',
        },
      ],
    },
  ],
};

const mockedUseFetchStorageQuotaValues = jest.spyOn(
  useFetchStorageQuotaValues,
  'useFetchStorageQuotaValues',
);
const mockedStorageQuotaReturnedData = [
  { unit: 'B', value: 1181116006400 },
  { unit: 'B', value: 644245094400 },
  { unit: 'B', value: 107374182400 },
];

describe('<PersistentStorageDropdown />', () => {
  const onChange = jest.fn();

  const defaultCluster = fixtures.clusterDetails.cluster;
  const defaultProps = {
    input: { onChange },
    product: defaultCluster.subscription.plan.type,
    cloudProviderID: defaultCluster.cloud_provider.id,
    billingModel: 'standard',
    isBYOC: defaultCluster.ccs.enabled,
    isMultiAZ: defaultCluster.multi_az,
    disabled: false,
  };

  const setMockingValues = () => {
    mockedUseFetchOrganizationAndQuota.mockReturnValue({
      isPending: false,
      isFetched: true,
      isError: false,
      quota: mockedQuotaListReturnedData,
    });

    mockedUseFetchStorageQuotaValues.mockReturnValue({
      isPending: false,
      isFetched: true,
      isError: false,
      data: mockedStorageQuotaReturnedData,
    });
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when persistent storage list needs to be fetched', () => {
    it('calls getPersistentStorage on mount', async () => {
      setMockingValues();
      expect(mockedUseFetchStorageQuotaValues).not.toHaveBeenCalled();
      render(<PersistentStorageDropdown {...defaultProps} />);

      expect(mockedUseFetchStorageQuotaValues).toHaveBeenCalled();
    });

    it('is accessible', async () => {
      setMockingValues();
      const { container } = render(<PersistentStorageDropdown {...defaultProps} />);
      await checkAccessibility(container);
    });
  });

  describe('when there was an error', () => {
    it('displays an error', async () => {
      setMockingValues();

      mockedUseFetchStorageQuotaValues.mockReturnValue({
        isPending: false,
        isFetched: true,
        isError: true,
        error: { errorMessage: 'This is an error message', operationID: 'error_id' },
        data: undefined,
      });

      render(<PersistentStorageDropdown {...defaultProps} />);

      expect(
        within(screen.getByTestId('alert-error')).getByText('This is an error message'),
      ).toBeInTheDocument();
    });
  });

  describe('when the request is pending', () => {
    it('displays a spinner', async () => {
      setMockingValues();

      mockedUseFetchStorageQuotaValues.mockReturnValue({
        isPending: true,
        isFetched: false,
        isError: false,
        error: undefined,
        data: undefined,
      });

      render(<PersistentStorageDropdown {...defaultProps} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading persistent storage list...')).toBeInTheDocument();
    });
  });

  describe('when the storage list is available', () => {
    it('displays expected options', async () => {
      setMockingValues();

      const { user } = render(<PersistentStorageDropdown {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Persistent Storage' }));

      expect(screen.getAllByRole('option')).toHaveLength(mockedStorageQuotaReturnedData.length);

      expect(screen.getByRole('option', { name: '100 GiB' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '600 GiB' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '1100 GiB' })).toBeInTheDocument();
    });

    it('displays expected options on expected order', async () => {
      setMockingValues();

      const { user } = render(<PersistentStorageDropdown {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Persistent Storage' }));

      const options = screen.getAllByRole('option');
      expect(within(options[0]).queryByText('100 GiB')).toBeInTheDocument();
      expect(within(options[1]).queryByText('600 GiB')).toBeInTheDocument();
      expect(within(options[2]).queryByText('1100 GiB')).toBeInTheDocument();
    });
  });
});
