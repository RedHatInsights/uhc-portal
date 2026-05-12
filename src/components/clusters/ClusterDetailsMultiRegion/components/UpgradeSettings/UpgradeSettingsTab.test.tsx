import React from 'react';

import docLinks from '~/common/docLinks.mjs';
import { useDeleteSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule';
import { useEditSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useEditSchedule';
import { useFetchUnmetAcknowledgements } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useFetchUnmetAcknowledgements';
import {
  refetchSchedules,
  useGetSchedules,
} from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { usePostSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostSchedule';
import { useReplaceSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useReplaceSchedule';
import { useFetchMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { Y_STREAM_CHANNEL } from '~/queries/featureGates/featureConstants';
import {
  checkAccessibility,
  mockUseFeatureGate,
  render,
  screen,
  waitFor,
  within,
} from '~/testUtils';
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
  canUpdateClusterResource: true,
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
    mockUseFeatureGate([]);
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

      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });
    it('should not show update button when no upgrades are available', () => {
      const clusterWithoutUpgrades = createMockCluster({
        version: { ...createMockCluster().version, available_upgrades: [] },
      });

      renderComponent(clusterWithoutUpgrades);

      expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
    });

    it('should not show update button when cluster is hibernating', () => {
      const hibernatingCluster = createMockCluster({ state: 'hibernating' });

      renderComponent(hibernatingCluster);

      expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
    });

    it('should dispatch openModal action when update button is clicked', async () => {
      const { user } = renderComponent();

      await user.click(screen.getByRole('button', { name: 'Update' }));

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

  describe('Channel settings', () => {
    beforeEach(() => {
      mockUseFeatureGate([[Y_STREAM_CHANNEL, true]]);
    });

    it('does not render channel settings when Y_STREAM_CHANNEL feature gate is disabled', () => {
      mockUseFeatureGate([[Y_STREAM_CHANNEL, false]]);

      renderComponent(
        createMockCluster({
          channel: 'stable-4.12',
          version: {
            id: '4.12.0',
            raw_id: 'openshift-v4.12.0',
            available_upgrades: ['4.12.1', '4.12.2'],
            available_channels: ['stable-4.12', 'eus-4.12'],
          },
        }),
      );

      expect(screen.queryByText('Channel settings')).not.toBeInTheDocument();
      expect(screen.queryByTestId('channelModal')).not.toBeInTheDocument();
    });

    it('renders channel settings card with current channel and edit button', () => {
      renderComponent(
        createMockCluster({
          channel: 'stable-4.12',
          version: {
            id: '4.12.0',
            raw_id: 'openshift-v4.12.0',
            available_upgrades: ['4.12.1', '4.12.2'],
            available_channels: ['stable-4.12', 'eus-4.12'],
          },
        }),
      );

      expect(screen.getByText('Channel settings')).toBeInTheDocument();
      expect(screen.getByText('Channel')).toBeInTheDocument();
      expect(screen.getByTestId('channelModal')).toBeInTheDocument();
    });

    it('opens edit channel modal when pencil icon is clicked', async () => {
      const { user } = renderComponent(
        createMockCluster({
          channel: 'stable-4.12',
          version: {
            id: '4.12.0',
            raw_id: 'openshift-v4.12.0',
            available_upgrades: ['4.12.1', '4.12.2'],
            available_channels: ['stable-4.12', 'eus-4.12'],
          },
        }),
      );

      await user.click(screen.getByTestId('channelModal'));

      const dialog = await screen.findByRole('dialog', { name: /edit channel/i });
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: 'Save' })).toBeInTheDocument();
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
      expect(link).toHaveAttribute('href', docLinks.ROSA_CLASSIC_MONITORING);
    });
  });

  describe('handleSubmit', () => {
    it('calls postScheduleMutate when switching from manual to recurring with no existing schedules', async () => {
      const postMutate = jest.fn();
      usePostScheduleMock.mockReturnValue({
        ...mockHookResponse,
        mutate: postMutate,
      });

      const { user } = renderComponent();

      await user.click(screen.getByRole('radio', { name: /Recurring updates/i }));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => {
        expect(postMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            schedule_type: 'automatic',
            schedule: expect.any(String),
          }),
          expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
      });
    });

    it('calls replaceScheduleMutate when switching from a manual schedule to recurring', async () => {
      useGetSchedulesMock.mockReturnValue({
        data: {
          items: [
            {
              id: 'manual-schedule-id',
              schedule_type: 'manual',
              upgrade_type: 'OSD',
            },
          ],
        },
        isLoading: false,
      } as any);

      const replaceMutate = jest.fn();
      useReplaceScheduleMock.mockReturnValue({
        ...mockHookResponse,
        mutate: replaceMutate,
      });

      const { user } = renderComponent();

      await user.click(screen.getByRole('radio', { name: /Recurring updates/i }));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => {
        expect(replaceMutate).toHaveBeenCalledWith(
          {
            oldScheduleID: 'manual-schedule-id',
            newSchedule: expect.objectContaining({
              schedule_type: 'automatic',
              schedule: expect.any(String),
            }),
          },
          expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
      });
    });

    it('calls editSchedulesMutate when the automatic schedule is changed', async () => {
      useGetSchedulesMock.mockReturnValue({
        data: {
          items: [
            {
              id: 'auto-policy-id',
              schedule_type: 'automatic',
              schedule: '00 2 * * 1',
              upgrade_type: 'OSD',
            },
          ],
        },
        isLoading: false,
      } as any);

      const editMutate = jest.fn();
      useEditScheduleMock.mockReturnValue({
        ...mockHookResponse,
        mutate: editMutate,
      });

      const { user } = renderComponent();

      await user.click(screen.getByRole('button', { name: /^Monday$/ }));
      await user.click(screen.getByRole('option', { name: /^Sunday$/ }));

      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => {
        expect(editMutate).toHaveBeenCalledWith(
          {
            policyID: 'auto-policy-id',
            schedule: {
              schedule: '00 2 * * 0',
            },
          },
          expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
      });
    });

    it('calls deleteScheduleMutate when switching from recurring to individual updates', async () => {
      useGetSchedulesMock.mockReturnValue({
        data: {
          items: [
            {
              id: 'automatic-policy-id',
              schedule_type: 'automatic',
              schedule: '00 2 * * 1',
              upgrade_type: 'OSD',
            },
          ],
        },
        isLoading: false,
      } as any);

      const deleteMutate = jest.fn();
      useDeleteScheduleMock.mockReturnValue({
        ...mockHookResponse,
        mutate: deleteMutate,
      });

      const { user } = renderComponent();

      await user.click(screen.getByRole('radio', { name: /Individual updates/i }));
      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => {
        expect(deleteMutate).toHaveBeenCalledWith(
          'automatic-policy-id',
          expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
      });
    });

    it('calls editClusterMutate when node drain grace period changes', async () => {
      const editClusterMutate = jest.fn();
      useEditClusterMock.mockReturnValue({
        ...mockHookResponse,
        mutate: editClusterMutate,
      });

      const { user } = renderComponent();

      await user.click(screen.getByTestId('grace-period-select'));
      await user.click(screen.getByRole('option', { name: /30 minutes/i }));

      await user.click(screen.getByRole('button', { name: /^save$/i }));

      await waitFor(() => {
        expect(editClusterMutate).toHaveBeenCalledWith(
          {
            clusterID: 'test-cluster-id',
            cluster: {
              node_drain_grace_period: { value: 30 },
            },
          },
          expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
      });
    });

    it('resets the form when Cancel is clicked after a change', async () => {
      const { user } = renderComponent();

      await user.click(screen.getByTestId('grace-period-select'));
      await user.click(screen.getByRole('option', { name: /30 minutes/i }));

      expect(screen.getByRole('button', { name: /cancel/i })).not.toBeDisabled();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.getByTestId('grace-period-select')).toHaveTextContent(/1 hour/i);
    });
  });

  describe('Additional coverage', () => {
    it('invalidates queries when edit cluster mutation reports success', () => {
      jest.clearAllMocks();
      useEditClusterMock.mockReturnValue({
        ...mockHookResponse,
        isPending: false,
        isSuccess: true,
      });

      renderComponent();

      expect(invalidateClusterDetailsQueries).toHaveBeenCalled();
      expect(refetchSchedules).toHaveBeenCalled();
    });

    it('shows delete-schedule error when unschedule fails', () => {
      useDeleteScheduleMock.mockReturnValue({
        ...mockHookResponse,
        isError: true,
        error: { message: 'Cannot delete' },
      } as any);

      renderComponent();

      expect(screen.getByText("Can't unschedule upgrade")).toBeInTheDocument();
    });

    it('disables save when an upgrade has started on the scheduled policy', () => {
      useGetSchedulesMock.mockReturnValue({
        data: {
          items: [
            {
              id: 'manual-pol',
              schedule_type: 'manual',
              upgrade_type: 'OSD',
              state: { value: 'started' },
            },
          ],
        },
        isLoading: false,
      } as any);

      renderComponent();

      expect(screen.getByRole('button', { name: /^save$/i })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('shows replace-schedule error when replaceSchedule fails', () => {
      useReplaceScheduleMock.mockReturnValue({
        ...mockHookResponse,
        isError: true,
        error: { message: 'Replace failed' },
      } as any);

      renderComponent();

      expect(screen.getByText("Can't schedule upgrade")).toBeInTheDocument();
    });

    it('shows edit-schedule error when editSchedule fails', () => {
      useEditScheduleMock.mockReturnValue({
        ...mockHookResponse,
        isError: true,
        error: { message: 'Edit failed' },
      } as any);

      renderComponent();

      expect(screen.getByText("Can't schedule upgrade")).toBeInTheDocument();
    });
  });
});
