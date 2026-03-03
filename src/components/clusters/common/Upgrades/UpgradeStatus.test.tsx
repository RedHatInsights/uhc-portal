import React from 'react';
import * as reactRedux from 'react-redux';

import { checkAccessibility, render, screen } from '~/testUtils';
import type { AugmentedCluster, UpgradePolicyWithState } from '~/types/types';

import UpgradeStatus from './UpgradeStatus';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
const mockedDispatch = jest.fn();
useDispatchMock.mockReturnValue(mockedDispatch);

const schedule: UpgradePolicyWithState = {
  version: '1.2.4',
  next_run: '2020-12-01T00:00:00.00Z',
  state: {
    value: 'scheduled' as const,
  },
  schedule_type: 'manual' as const,
};

const cancelButtonText = 'Cancel this update';

describe('<UpgradeStatus />', () => {
  const onCancelClick = jest.fn();
  const openModal = jest.fn();

  const defaultProps = {
    clusterID: 'myClusterId',
    availableUpgrades: [],
    canEdit: true,
    clusterVersion: '1.2.3',
    clusterVersionRawID: '1.2.3',
    cluster: {
      version: {
        raw_id: '1.2.3',
      },
      subscription: {
        id: 'mock-subscription-id',
        status: 'Active',
        managed: true,
        rh_region_id: 'us-east-1',
      },
    } as AugmentedCluster,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when cluster is up to date', () => {
    it('is accessible without a cancel button', async () => {
      const { container } = render(<UpgradeStatus {...defaultProps} />);

      expect(screen.queryByRole('button', { name: cancelButtonText })).not.toBeInTheDocument();
      await checkAccessibility(container);
    });

    it('shows up to date', () => {
      const { container } = render(<UpgradeStatus {...defaultProps} />);
      expect(screen.getByText('Up to date')).toBeInTheDocument();

      // The only way to determine an icon is by class
      // because the image is technically hidden (aria-hidden='true')
      expect(container.querySelector('.ocm-cluster-up-to-date-icon')).toBeInTheDocument();
    });
  });
  describe('when updates are available', () => {
    const updateAvailableProps = {
      ...defaultProps,
      availableUpgrades: ['1.2.4'],
    };

    it('should show  Update available', () => {
      const { container } = render(<UpgradeStatus {...updateAvailableProps} />);
      expect(screen.getByText(/Update available/)).toBeInTheDocument();
      expect(container.querySelector('.ocm-upgrade-available-icon')).toBeInTheDocument();
    });
  });
  describe('when a manual update is scheduled', () => {
    const manualUpgradeScheduled = {
      ...defaultProps,
      scheduledUpgrade: schedule,
      availableUpgrades: ['1.2.4'],
    };

    it('should show  Update available', async () => {
      const { container } = render(<UpgradeStatus {...manualUpgradeScheduled} />);

      expect(container.querySelector('.ocm-upgrade-available-icon')).toBeInTheDocument();

      expect(screen.getByText(/Update available/)).toBeInTheDocument();
      expect(screen.getByText('Upgrade scheduled')).toBeInTheDocument();
    });

    it('cancel button should be functional', async () => {
      const { user } = render(
        <UpgradeStatus {...manualUpgradeScheduled} onCancelClick={onCancelClick} />,
      );
      expect(onCancelClick).not.toHaveBeenCalled();
      expect(openModal).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: cancelButtonText }));
      expect(onCancelClick).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalledWith({
        type: 'OPEN_MODAL',
        payload: {
          name: 'cancel-upgrade',
          data: { clusterID: 'myClusterId', schedule, region: 'us-east-1' },
        },
      });
    });

    it('should show the scheduled time', () => {
      render(<UpgradeStatus {...manualUpgradeScheduled} />);

      expect(screen.getByText('Upgrade scheduled')).toBeInTheDocument();
      expect(screen.getByText(/1 Dec 2020, 00:00 UTC/)).toBeInTheDocument();
    });

    it('should not show cancel button when canEdit is false', () => {
      const nonEditProps = {
        ...manualUpgradeScheduled,
        canEdit: false,
      };
      render(<UpgradeStatus {...nonEditProps} />);
      expect(screen.queryByRole('button', { name: cancelButtonText })).not.toBeInTheDocument();
    });
  });
  describe('when an automatic update is scheduled', () => {
    const automaticUpdateScheduleProps = {
      ...defaultProps,
      availableUpgrades: ['1.2.4'],
      scheduledUpgrade: {
        ...schedule,
        schedule_type: 'automatic' as const,
      },
    };

    it('should show Update available', () => {
      const { container } = render(<UpgradeStatus {...automaticUpdateScheduleProps} />);
      expect(screen.getByText(/Update available/)).toBeInTheDocument();
      expect(container.querySelector('.ocm-upgrade-available-icon')).toBeInTheDocument();
    });

    it('should not have a cancel button', () => {
      render(<UpgradeStatus {...automaticUpdateScheduleProps} />);
      expect(screen.queryByRole('button', { name: cancelButtonText })).not.toBeInTheDocument();
    });

    it('should show upgrade time when the schedule is "scheduled"', () => {
      render(<UpgradeStatus {...automaticUpdateScheduleProps} />);
      expect(screen.getByText('Upgrade scheduled')).toBeInTheDocument();
      expect(screen.getByText(/1 Dec 2020, 00:00 UTC/)).toBeInTheDocument();
    });

    it('should not show upgrade time when the schedule is "pending"', () => {
      const pendingProps = {
        ...automaticUpdateScheduleProps,
        scheduledUpgrade: {
          ...schedule,
          schedule_type: 'automatic' as const,
          state: { value: 'pending' as const },
        },
      };

      render(<UpgradeStatus {...pendingProps} />);

      expect(screen.getByText(/Update available/)).toBeInTheDocument();
      expect(screen.queryByText(/1 Dec 2020, 00:00 UTC/)).not.toBeInTheDocument();
      expect(screen.queryByText('Upgrade scheduled')).not.toBeInTheDocument();
    });
  });

  describe('when an update is in progress', () => {
    const updateInProgressProps = {
      ...defaultProps,
      availableUpgrades: ['1.2.4'],
      scheduledUpgrade: {
        ...schedule,
        state: {
          value: 'started' as const,
        },
      },
    };

    it('should show an InProgressIcon', () => {
      const { container } = render(<UpgradeStatus {...updateInProgressProps} />);
      expect(screen.getByText('Update in progress')).toBeInTheDocument();
      expect(container.querySelector('.ocm-upgrade-in-progress-icon')).toBeInTheDocument();
    });

    it('should not have a cancel button', () => {
      render(<UpgradeStatus {...updateInProgressProps} />);
      expect(screen.queryByRole('button', { name: cancelButtonText })).not.toBeInTheDocument();
    });

    it('should not show date', () => {
      render(<UpgradeStatus {...updateInProgressProps} />);
      expect(screen.queryByText(/1 Dec 2020, 00:00 UTC/)).not.toBeInTheDocument();
    });
  });
});
