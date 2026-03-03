import React from 'react';
import * as reactRedux from 'react-redux';

import * as useFetchLoadBalancerQuotaValues from '~/queries/ClusterActionsQueries/useFetchLoadBalancerQuotaValues';
import * as useFetchStorageQuotaValues from '~/queries/ClusterActionsQueries/useFetchStorageQuotaValues';
import * as useEditCluster from '~/queries/ClusterDetailsQueries/useEditCluster';
import * as useFetchOrganizationAndQuota from '~/queries/common/useFetchOrganizationAndQuota';
import * as refreshQueriesModule from '~/queries/refreshEntireCache';
import { checkAccessibility, screen, withState } from '~/testUtils';

import ScaleClusterDialog from './ScaleClusterDialog';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedUseEditCluster = jest.spyOn(useEditCluster, 'useEditCluster');
const mockedRefreshQueries = jest.spyOn(refreshQueriesModule, 'refreshQueries');

const mockedUseFetchLoadBalancerQuotaValues = jest.spyOn(
  useFetchLoadBalancerQuotaValues,
  'useFetchLoadBalancerQuotaValues',
);
const mockedUseFetchLoadBalancerQuotaValuesReturnedData = [0, 4, 8, 12, 16, 20];

const mockedUseFetchOrganizationAndQuota = jest.spyOn(
  useFetchOrganizationAndQuota,
  'useFetchOrganizationAndQuota',
);
const mockedQuotaListReturnedData = [
  {
    allowed: 2500,
    consumed: 0,
    quota_id: 'pv.storage|gp2',
    related_resources: [
      {
        availability_zone_type: 'any',
        billing_model: 'standard',
        byoc: 'rhinfra',
        cloud_provider: 'any',
        cost: 1,
        product: 'ANY',
        resource_name: 'gp2',
        resource_type: 'pv.storage',
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
];

const mockedUseFetchStorageQuotaValues = jest.spyOn(
  useFetchStorageQuotaValues,
  'useFetchStorageQuotaValues',
);
const mockedStorageQuotaReturnedData = [
  {
    value: 107374182400,
    unit: 'B',
  },
  {
    value: 644245094400,
    unit: 'B',
  },
  {
    value: 1181116006400,
    unit: 'B',
  },
  {
    value: 1717986918400,
    unit: 'B',
  },
  {
    value: 2254857830400,
    unit: 'B',
  },
  {
    value: 2791728742400,
    unit: 'B',
  },
  {
    value: 3328599654400,
    unit: 'B',
  },
  {
    value: 3865470566400,
    unit: 'B',
  },
  {
    value: 4402341478400,
    unit: 'B',
  },
  {
    value: 7623566950400,
    unit: 'B',
  },
];

describe('<ScaleClusterDialog />', () => {
  const mockMutate = jest.fn();
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  // need to set form values
  const defaultState = {
    modal: {
      data: {
        load_balancer_quota: 4,
        storage_quota: { value: 107374182400, unit: 'B' },
        console: { url: 'my_console_url' },
        ccs: { enabled: false },
        subscription: {
          display_name: 'my_cluster_name',
          cluster_billing_model: 'standard',
          plan: { id: 'OSD' },
        },
        shouldDisplayClusterName: true,
        cloud_provider: { id: 'aws' },
        multi_az: true,
        id: 'test-id',
      },
    },
  };

  const setMockingValues = () => {
    mockedUseFetchLoadBalancerQuotaValues.mockReturnValue({
      isPending: false,
      isFetched: true,
      isError: false,
      data: mockedUseFetchLoadBalancerQuotaValuesReturnedData,
    });

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
    mockedUseEditCluster.mockReturnValue({
      mutate: mockMutate,
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    setMockingValues();

    const { container } = withState(defaultState, true).render(<ScaleClusterDialog />);
    expect(await screen.findByText('Load balancers')).toBeInTheDocument();

    await checkAccessibility(container);
  });

  describe('fetching data ', () => {
    it('on load fetches  storage and load balancers data', () => {
      setMockingValues();
      expect(mockedUseFetchLoadBalancerQuotaValues).not.toHaveBeenCalled();
      expect(mockedUseFetchOrganizationAndQuota).not.toHaveBeenCalled();
      expect(mockedUseFetchStorageQuotaValues).not.toHaveBeenCalled();

      withState(defaultState, true).render(<ScaleClusterDialog />);

      expect(mockedUseFetchLoadBalancerQuotaValues).toHaveBeenCalled();
      expect(mockedUseFetchOrganizationAndQuota).toHaveBeenCalled();
      expect(mockedUseFetchStorageQuotaValues).toHaveBeenCalled();
    });
  });

  it('when cancelled, closes modal', async () => {
    setMockingValues();

    const { user } = withState(defaultState, true).render(<ScaleClusterDialog />);

    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls submit when submit button is clicked', async () => {
    setMockingValues();

    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();

    const { user } = withState(defaultState, true).render(<ScaleClusterDialog />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Load Balancers' }),
      screen.getByRole('option', { name: '0' }),
    );

    expect(screen.getByRole('button', { name: 'Apply' })).not.toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalled();
  });

  it('when fulfilled, closes dialog', async () => {
    setMockingValues();
    mockedRefreshQueries.mockImplementation(() => {});

    // Capture the onSuccess callback that will be passed to mutate
    let onSuccessCallback;
    mockMutate.mockImplementation((data, options) => {
      onSuccessCallback = options?.onSuccess;
    });

    const { user } = withState(defaultState, true).render(<ScaleClusterDialog />);

    // Change a value to enable the Apply button
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Load Balancers' }),
      screen.getByRole('option', { name: '0' }),
    );

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    // Verify mutate was called with the correct payload
    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith(
      {
        clusterID: defaultState.modal.data.id,
        cluster: {
          load_balancer_quota: 0,
          storage_quota: {
            unit: 'B',
            value: defaultState.modal.data.storage_quota.value,
          },
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    // Manually trigger the onSuccess callback
    expect(onSuccessCallback).toBeDefined();
    onSuccessCallback();

    // Verify that closeModal was dispatched
    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    // Verify that refreshQueries was called
    expect(mockedRefreshQueries).toHaveBeenCalled();
  });

  it('renders correctly when an error occurs', async () => {
    setMockingValues();

    mockedUseEditCluster.mockReturnValue({
      isLoading: false,
      isError: true,
      error: { errorMessage: 'I am an error' },
    });
    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();

    withState(defaultState, true).render(<ScaleClusterDialog />);

    expect(await screen.findByText('Load balancers')).toBeInTheDocument();

    expect(screen.getByText('I am an error')).toBeInTheDocument();
  });
});
