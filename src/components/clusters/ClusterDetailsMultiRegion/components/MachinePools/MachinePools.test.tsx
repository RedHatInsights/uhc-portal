import React from 'react';

import fixtures from '~/components/clusters/ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';
import { screen, withState } from '~/testUtils';

import MachinePools from './MachinePools';

// --- Module mocks ---

jest.mock('~/redux/actions/userActions', () => ({
  getOrganizationAndQuota: jest.fn(() => ({ type: 'GET_ORG_AND_QUOTA_MOCK' })),
}));

jest.mock('./machinePoolsSelectors', () => ({
  hasMachinePoolsQuotaSelector: jest.fn(() => true),
  hasOrgLevelBypassPIDsLimitCapability: jest.fn(() => false),
}));

jest.mock(
  '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes',
  () => ({
    useFetchMachineTypes: jest.fn(() => ({
      data: { types: {}, typesByID: {} },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    })),
  }),
);

jest.mock('~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools', () => ({
  useFetchMachineOrNodePools: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock(
  '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useFetchClusterAutoscaler',
  () => ({
    useFetchClusterAutoscaler: jest.fn(() => ({
      data: null,
      isLoading: false,
      hasClusterAutoscaler: false,
      isStale: false,
      isRefetching: false,
    })),
    refetchClusterAutoscalerData: jest.fn(),
  }),
);

jest.mock('~/queries/ClusterDetailsQueries/MachinePoolTab/useDeleteMachinePool', () => ({
  useDeleteMachinePool: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  })),
}));

jest.mock('./UpdateMachinePools', () => ({
  UpdateAllMachinePools: () => null,
  UpdateMachinePoolModal: () => null,
}));

jest.mock('./components/EditMachinePoolModal/EditMachinePoolModal', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <button type="button" onClick={onClose}>
      Close modal
    </button>
  ),
}));

// --- Fixtures ---

const cluster = {
  ...fixtures.clusterDetails.cluster,
  machinePoolsActions: { update: true },
};

// --- Tests ---

describe('<MachinePools />', () => {
  describe('auto-refresh guard — Redux modal sync', () => {
    it('opens EDIT_MACHINE_POOL in Redux when Add machine pool is clicked', async () => {
      const testState = withState({});
      const { user } = testState.render(<MachinePools cluster={cluster} />);

      await user.click(screen.getByRole('button', { name: 'Add machine pool' }));

      expect(testState.getState().modal.modalName).toBe('edit-machine-pool');
    });

    it('clears Redux modal when the modal is closed', async () => {
      const testState = withState({});
      const { user } = testState.render(<MachinePools cluster={cluster} />);

      await user.click(screen.getByRole('button', { name: 'Add machine pool' }));
      expect(testState.getState().modal.modalName).toBe('edit-machine-pool');

      await user.click(screen.getByRole('button', { name: 'Close modal' }));
      expect(testState.getState().modal.modalName).toBeNull();
    });
  });
});
