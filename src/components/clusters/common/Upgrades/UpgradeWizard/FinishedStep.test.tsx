import React from 'react';

import { render, screen, waitFor } from '~/testUtils';

import FinishedStep from './FinishedStep';

interface DefaultProps {
  close: jest.Mock;
  scheduleType: 'now' | 'time';
  upgradeTimestamp: string;
  isPostScheduleError: boolean;
  postScheduleError: any;
  isPostSchedulePending: boolean;
}

interface TestProps extends DefaultProps {
  isPostScheduleSuccess?: boolean;
}

const defaultProps: DefaultProps = {
  close: jest.fn(),
  scheduleType: 'time',
  upgradeTimestamp: '2025-06-03T05:00:00.000Z',
  isPostScheduleError: false,
  postScheduleError: null,
  isPostSchedulePending: false,
};

describe('<FinishedStep />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls close modal when clicking close', async () => {
    const newProps: TestProps = { ...defaultProps, isPostScheduleSuccess: true };
    const { user } = render(<FinishedStep {...newProps} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(defaultProps.close).toHaveBeenCalled();
  });

  it('shows spinner when add user is pending', () => {
    const newProps: TestProps = { ...defaultProps, isPostSchedulePending: true };

    render(<FinishedStep {...newProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('displays error when error occurs', () => {
    const newProps: TestProps = {
      ...defaultProps,
      isPostScheduleError: true,
      postScheduleError: { errorMessage: 'new error' },
    };

    render(<FinishedStep {...newProps} />);

    expect(screen.getByText('Failed to schedule upgrade')).toBeInTheDocument();
  });

  it('displays correct message when schedule type is now', () => {
    const newProps: TestProps = {
      ...defaultProps,
      scheduleType: 'now',
      isPostScheduleSuccess: true,
    };

    render(<FinishedStep {...newProps} />);

    expect(
      screen.getByText('Your update was successfully scheduled to start within the next hour.'),
    ).toBeInTheDocument();
  });
});
