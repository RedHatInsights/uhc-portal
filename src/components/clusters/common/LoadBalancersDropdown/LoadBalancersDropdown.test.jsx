import React from 'react';

import * as useFetchLoadBalancerQuotaValues from '~/queries/ClusterActionsQueries/useFetchLoadBalancerQuotaValues';
import * as useFetchOrganizationAndQuota from '~/queries/common/useFetchOrganizationAndQuota';
import { checkAccessibility, render, screen, waitFor, within } from '~/testUtils';

import fixtures from '../../ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';

import LoadBalancersDropdown from './LoadBalancersDropdown';

const mockedUseFetchOrganizationAndQuota = jest.spyOn(
  useFetchOrganizationAndQuota,
  'useFetchOrganizationAndQuota',
);

const mockedQuotaListReturnedData = {
  items: [
    {
      kind: 'QuotaCost',
      href: '/api/accounts_mgmt/v1/organizations/1MK6ieFXd0eu1hERdENAPvpbi7x/quota_cost',
      organization_id: '1MK6ieFXd0eu1hERdENAPvpbi7x',
      quota_id: 'network.loadbalancer|network',
      allowed: 17,
      consumed: 0,
      related_resources: [
        {
          cloud_provider: 'any',
          resource_name: 'network',
          resource_type: 'network.loadbalancer',
          byoc: 'rhinfra',
          availability_zone_type: 'any',
          product: 'ANY',
          billing_model: 'standard',
          cost: 1,
        },
        {
          cloud_provider: 'any',
          resource_name: 'network',
          resource_type: 'network.loadbalancer',
          byoc: 'byoc',
          availability_zone_type: 'any',
          product: 'ANY',
          billing_model: 'standard',
          cost: 0,
        },
      ],
    },
  ],
};

const mockedUseFetchLoadBalancerQuotaValues = jest.spyOn(
  useFetchLoadBalancerQuotaValues,
  'useFetchLoadBalancerQuotaValues',
);

const mockedLoadBalancerValues = [0, 4, 8, 12, 16, 20, 24];

describe('<LoadBalancersDropdown />', () => {
  const onChange = jest.fn();

  const defaultProps = {
    input: { onChange },
    product: fixtures.clusterDetails.cluster.subscription.plan.type,
    cloudProviderID: fixtures.clusterDetails.cluster.cloud_provider.id,
    billingModel: 'standard',
    isBYOC: fixtures.clusterDetails.cluster.ccs.enabled,
    isMultiAZ: fixtures.clusterDetails.cluster.multi_az,
    disabled: false,
  };

  const setMockingValues = () => {
    mockedUseFetchOrganizationAndQuota.mockReturnValue({
      isPending: false,
      isFetched: true,
      isError: false,
      quota: mockedQuotaListReturnedData,
    });

    mockedUseFetchLoadBalancerQuotaValues.mockReturnValue({
      isPending: false,
      isFetched: true,
      isError: false,
      data: mockedLoadBalancerValues,
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when load balancer list needs to be fetched', () => {
    it('calls getLoadBalancers', () => {
      setMockingValues();
      expect(mockedUseFetchLoadBalancerQuotaValues).not.toHaveBeenCalled();
      render(<LoadBalancersDropdown {...defaultProps} />);
      expect(mockedUseFetchLoadBalancerQuotaValues).toHaveBeenCalled();
    });
  });

  describe('when there was an error', () => {
    it('displays an error', () => {
      setMockingValues();
      mockedUseFetchLoadBalancerQuotaValues.mockReturnValue({
        isPending: false,
        isFetched: true,
        isError: true,
        error: { errorMessage: 'This is an error message', operationID: 'error_id' },
        data: undefined,
      });

      render(<LoadBalancersDropdown {...defaultProps} />);

      expect(
        within(screen.getByTestId('alert-error')).getByText('This is an error message'),
      ).toBeInTheDocument();
    });
  });

  describe('when the request is pending', () => {
    it('is accessible', async () => {
      setMockingValues();
      mockedUseFetchLoadBalancerQuotaValues.mockReturnValue({
        isPending: true,
        isFetched: false,
        isError: false,
        data: undefined,
      });
      const { container } = render(<LoadBalancersDropdown {...defaultProps} />);
      expect(screen.getByText('Loading load balancers list...')).toBeInTheDocument();
      await checkAccessibility(container);
    });
  });

  describe('when the load balancer list is available', () => {
    it('shows expected options', async () => {
      // loadBalancerQuotaList allows 17.
      const listAllowedWithQuota = mockedLoadBalancerValues.filter((item) => item < 17);

      setMockingValues();
      const { container, user } = render(<LoadBalancersDropdown {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Load Balancers' }));

      await waitFor(() =>
        expect(screen.getAllByRole('option')).toHaveLength(listAllowedWithQuota.length),
      );

      listAllowedWithQuota.forEach((item) => {
        expect(screen.getByRole('option', { name: String(item) })).toBeInTheDocument();
      });
      await checkAccessibility(container);
    });
  });
});
