import React from 'react';

import links from '~/common/installLinks.mjs';
import { useDeleteSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule';
import { useEditSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useEditSchedule';
import { useFetchUnmetAcknowledgements } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useFetchUnmetAcknowledgements';
import { useGetSchedules } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { usePostSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostSchedule';
import { useReplaceSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useReplaceSchedule';
import { useFetchMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { checkAccessibility, render, screen } from '~/testUtils';
import { AugmentedCluster } from '~/types/types';

import UpgradeSettingsTab from './UpgradeSettingsTab';

// Mock all external hooks and dependencies
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const mockGetSchedules = { data: { items: [] }, isLoading: false };
const mockHookResponse = {
  isPending: false,
  isError: false,
  error: null,
  mutate: jest.fn(),
  isSuccess: false,
};
const mockUnmetAcknowledgements = { data: [], hasVersionGates: false, mutate: jest.fn() };
const mockMachinePoolData = { data: null, isError: false };

jest.mock('~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules', () => ({
  useGetSchedules: jest.fn(),
  refetchSchedules: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/ClusterSettingsTab/useEditSchedule', () => ({
  useEditSchedule: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/ClusterSettingsTab/useReplaceSchedule', () => ({
  useReplaceSchedule: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostSchedule', () => ({
  usePostSchedule: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule', () => ({
  useDeleteSchedule: jest.fn(),
}));

jest.mock(
  '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useFetchUnmetAcknowledgements',
  () => ({
    useFetchUnmetAcknowledgements: jest.fn(),
  }),
);

jest.mock('~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools', () => ({
  useFetchMachineOrNodePools: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/useEditCluster', () => ({
  useEditCluster: jest.fn(),
}));

jest.mock('~/queries/ClusterDetailsQueries/useFetchClusterDetails', () => ({
  invalidateClusterDetailsQueries: jest.fn(),
}));

// Test fixtures
const createMockCluster = (overrides = {}) => ({
  id: 'test-cluster-id',
  name: 'test-cluster',
  state: 'ready',
  status: { configuration_mode: 'full' },
  canEdit: true,
  subscription: {
    id: 'test-subscription-id',
    plan: { type: 'OSD' },
    rh_region_id: 'us-east-1',
  },
  openshift_version: '4.12.0',
  version: {
    id: '4.12.0',
    raw_id: 'openshift-v4.12.0',
    available_upgrades: ['4.12.1', '4.12.2'],
  },
  node_drain_grace_period: { value: 60 },
  disable_user_workload_monitoring: false,
  aws: { sts: { enabled: false } },
  metrics: { upgrade: { state: 'available' } },
  ...overrides,
});

const useGetSchedulesMock = useGetSchedules as jest.Mock;
const useEditScheduleMock = useEditSchedule as jest.Mock;
const usePostScheduleMock = usePostSchedule as jest.Mock;
const useReplaceScheduleMock = useReplaceSchedule as jest.Mock;
const useDeleteScheduleMock = useDeleteSchedule as jest.Mock;
const useFetchUnmetAcknowledgementsMock = useFetchUnmetAcknowledgements as jest.Mock;
const useFetchMachineOrNodePoolsMock = useFetchMachineOrNodePools as jest.Mock;
const useEditClusterMock = useEditCluster as jest.Mock;

const renderComponent = (cluster = createMockCluster()) =>
  render(<UpgradeSettingsTab cluster={cluster as AugmentedCluster} />);

describe('<UpgradeSettingsTab>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGetSchedulesMock.mockReturnValue(mockGetSchedules);
    usePostScheduleMock.mockReturnValue(mockHookResponse);
    useReplaceScheduleMock.mockReturnValue(mockHookResponse);
    useDeleteScheduleMock.mockReturnValue(mockHookResponse);
    useFetchUnmetAcknowledgementsMock.mockReturnValue(mockUnmetAcknowledgements);
    useFetchMachineOrNodePoolsMock.mockReturnValue(mockMachinePoolData);
    useEditScheduleMock.mockReturnValue(mockHookResponse);
    useEditClusterMock.mockReturnValue(mockHookResponse);
  });

  describe('Initial rendering', () => {
    it('should render update strategy card with correct title', () => {
      renderComponent();

      expect(screen.getByText('Update strategy')).toBeInTheDocument();
    });

    it('should render update status card with correct title', () => {
      renderComponent();

      expect(screen.getByText('Update status')).toBeInTheDocument();
    });

    it('should render User Workload Monitoring section for standard OSD clusters', () => {
      renderComponent();

      expect(screen.getByText('Monitoring')).toBeInTheDocument();
    });

    it('should not render User Workload Monitoring section for ARO clusters', () => {
      const aroCluster = createMockCluster({
        subscription: {
          ...createMockCluster().subscription,
          plan: { type: 'ARO' },
        },
      });

      renderComponent(aroCluster);

      expect(screen.queryByTestId('Monitoring')).not.toBeInTheDocument();
    });

    it('should not render User Workload Monitoring section for HCP clusters', async () => {
      const rosaCluster = createMockCluster({
        subscription: {
          ...createMockCluster().subscription,
          plan: { type: 'ROSA' },
        },
        hypershift: {
          enabled: true,
        },
      });

      renderComponent(rosaCluster);

      expect(screen.queryByLabelText('Monitoring')).not.toBeInTheDocument();
    });
  });

  describe('Update button functionality', () => {
    it('should show update button when cluster has available upgrades', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });
    it('should not show update button when no upgrades are available', () => {
      const clusterWithoutUpgrades = createMockCluster({
        version: { ...createMockCluster().version, available_upgrades: [] },
      });

      renderComponent(clusterWithoutUpgrades);

      expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
    });

    it('should not show update button when cluster is hibernating', () => {
      const hibernatingCluster = createMockCluster({ state: 'hibernating' });

      renderComponent(hibernatingCluster);

      expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
    });

    it('should dispatch openModal action when update button is clicked', async () => {
      const { user } = renderComponent();

      await user.click(screen.getByRole('button', { name: /update/i }));

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            name: 'upgrade-wizard',
            data: {
              clusterName: 'test-cluster',
              subscriptionID: 'test-subscription-id',
            },
          }),
        }),
      );
    });
  });

  describe('Cluster state handling', () => {
    it('should show hibernation alert when cluster is hibernating', () => {
      const hibernatingCluster = createMockCluster({ state: 'hibernating' });

      renderComponent(hibernatingCluster);

      expect(
        screen.getByText(/Version updates will not occur while this cluster is Hibernating/),
      ).toBeInTheDocument();
    });

    it('should disable form controls for read-only clusters', () => {
      const readOnlyCluster = createMockCluster({
        status: { configuration_mode: 'read_only' },
      });

      renderComponent(readOnlyCluster);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable form controls for not ready clusters', () => {
      const notReadyCluster = createMockCluster({ state: 'installing' });

      renderComponent(notReadyCluster);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Form controls', () => {
    it('should render save and cancel buttons', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should disable save button initially when form is pristine', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('should disable cancel button initially when form is pristine', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /cancel/i })).toHaveAttribute('disabled', '');
    });
  });

  describe('Error handling', () => {
    it('should display error message when edit cluster fails', () => {
      useEditClusterMock.mockReturnValue({
        ...mockHookResponse,
        isError: true,
        error: { message: 'Failed to edit cluster' },
      } as any);

      renderComponent();

      expect(screen.getByText('Error processing request')).toBeInTheDocument();
    });

    it('should display error when schedule operations fail', () => {
      usePostScheduleMock.mockReturnValue({
        ...mockHookResponse,
        isError: true,
        error: { message: 'Schedule creation failed' },
      } as any);

      renderComponent();

      expect(screen.getByText("Can't schedule upgrade")).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should disable save button when schedules are loading', () => {
      useGetSchedulesMock.mockReturnValue({
        data: { items: [] },
        isLoading: true,
      } as any);

      renderComponent();

      expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('should disable save button during pending operations', () => {
      useEditScheduleMock.mockReturnValue({
        ...mockHookResponse,
        isPending: true,
      } as any);

      renderComponent();

      expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with default props', async () => {
      const { container } = renderComponent();

      await checkAccessibility(container);
    });

    it('should be accessible when showing errors', async () => {
      useEditClusterMock.mockReturnValue({
        ...mockHookResponse,
        isError: true,
        error: { message: 'Test error' },
      } as any);

      const { container } = renderComponent();

      await checkAccessibility(container);
    });

    it('should be accessible for hibernating clusters', async () => {
      const hibernatingCluster = createMockCluster({ state: 'hibernating' });
      const { container } = renderComponent(hibernatingCluster);

      await checkAccessibility(container);
    });
  });

  describe('Scheduled upgrades handling', () => {
    it('should not show update button when manual upgrade is scheduled', () => {
      useGetSchedulesMock.mockReturnValue({
        data: {
          items: [
            {
              id: 'test-schedule-id',
              schedule_type: 'manual',
              upgrade_type: 'OSD',
            },
          ],
        },
        isLoading: false,
      } as any);

      renderComponent();

      expect(screen.queryByRole('button', { name: /Update/ })).not.toBeInTheDocument();
    });

    it('should handle automatic upgrade policy initialization', () => {
      useGetSchedulesMock.mockReturnValue({
        data: {
          items: [
            {
              id: 'test-schedule-id',
              schedule_type: 'automatic',
              schedule: '0 2 * * 1',
            },
          ],
        },
        isLoading: false,
      } as any);

      renderComponent();

      // Should render the component without errors with automatic schedule
      expect(screen.getByText('Select a day and start time')).toBeInTheDocument();
    });
  });

  describe('Documentation links', () => {
    it('renders correct monitoring link when classic', async () => {
      const rosaCluster = createMockCluster({
        subscription: {
          ...createMockCluster().subscription,
          plan: { type: 'ROSA' },
        },
      });

      const { user } = renderComponent(rosaCluster);
      const moreInfoBtn = await screen.findByLabelText('More information');
      await user.click(moreInfoBtn);

      const link = screen.getByText('Learn more');
      expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_MONITORING);
    });
  });
});
