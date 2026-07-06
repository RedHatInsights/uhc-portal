import React from 'react';
import * as reactRedux from 'react-redux';

import * as useUpgradeClusterFromTrial from '~/queries/ClusterActionsQueries/useUpgradeClusterFromTrial';
import * as useFetchMachineTypes from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import * as useFetchMachineOrNodePools from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';

import { screen, withState } from '../../../../testUtils';
import fixtures from '../../ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';
import { emptyQuotaList, mockQuotaList } from '../__tests__/quota.fixtures';

import UpgradeTrialClusterDialog from './UpgradeTrialClusterDialog';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedUseUpgradeClusterFromTrial = jest.spyOn(
  useUpgradeClusterFromTrial,
  'useUpgradeClusterFromTrial',
);
const mockedUseFetchMachineOrNodePools = jest.spyOn(
  useFetchMachineOrNodePools,
  'useFetchMachineOrNodePools',
);
const mockedUseFetchMachineTypes = jest.spyOn(useFetchMachineTypes, 'useFetchMachineTypes');

describe('<UpgradeTrialClusterDialog />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const organizationState = {
    userProfile: {
      organization: {
        fulfilled: true,
        pending: false,
        quotaList: emptyQuotaList,
      },
    },
  };

  const defaultState = {
    modal: {
      data: {
        clusterID: 'my-cluster-id',
        cluster: fixtures.OSDTrialClusterDetails,
      },
    },
    ...organizationState,
  };

  const machineTypesByID = {
    'm5.xlarge': { id: 'm5.xlarge', generic_name: 'standard-4' },
  };
  const machinePools = [
    {
      instance_type: 'm5.xlarge',
      replicas: 3,
    },
  ];
  let onClose;
  let mutate;

  mockedUseFetchMachineOrNodePools.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: machinePools,
  });

  mockedUseFetchMachineTypes.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: {
      typesByID: machineTypesByID,
    },
  });

  beforeEach(() => {
    onClose = jest.fn();
    mutate = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders no-quota alert when there is no quota', () => {
    withState(defaultState).render(<UpgradeTrialClusterDialog isOpen onClose={onClose} />);
    expect(screen.getByTestId('no-quota-alert')).toBeInTheDocument();
    expect(screen.getByText('Contact sales')).toBeInTheDocument();
    // when there's no quota there is only a single action button, so we can use a small PF modal
    expect(screen.getByRole('dialog')).toHaveClass('pf-m-sm');
  });

  it('allows upgrade via standard billing', () => {
    mockedUseFetchMachineOrNodePools.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: [
        {
          instance_type: 'm5.xlarge',
          replicas: 130,
        },
      ],
    });

    const orgState = {
      userProfile: {
        organization: {
          fulfilled: true,
          pending: false,
          quotaList: mockQuotaList,
        },
      },
    };
    const updatedState = {
      ...defaultState,
      ...orgState,
    };

    withState(updatedState).render(<UpgradeTrialClusterDialog isOpen onClose={onClose} />);
    expect(screen.queryByTestId('no-quota-alert')).not.toBeInTheDocument();
    expect(screen.getByText('Upgrade using quota')).toBeInTheDocument();
  });

  it('renders error box when an error occurs', () => {
    mockedUseUpgradeClusterFromTrial.mockReturnValue({
      isPending: false,
      isError: true,
      mutate,
      error: 'I am error',
    });
    withState(defaultState).render(<UpgradeTrialClusterDialog isOpen onClose={onClose} />);

    expect(screen.getByText('Error upgrading cluster')).toBeInTheDocument();
  });
});
