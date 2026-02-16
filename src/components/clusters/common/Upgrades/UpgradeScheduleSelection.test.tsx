import React from 'react';

import UpgradeScheduleSelection from '~/components/clusters/common/Upgrades/UpgradeScheduleSelection';
import { checkAccessibility, render, screen } from '~/testUtils';

const hours: [number, string][] = Array.from(Array(24).keys()).map((hour: number) => [
  hour,
  `${hour.toString().padStart(2, '0')}:00 UTC`,
]);

const days: [number, string][] = [
  [0, 'Sunday'],
  [1, 'Monday'],
  [2, 'Tuesday'],
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday'],
];

const infoAlert: string =
  'Recurring updates occur when a new patch (z-stream) update becomes available at least 2 days prior to your selected start time.';

const infoAlertHypershift: string =
  'For recurring updates, the control plane will be updated when a new version becomes available at least 2 days prior to your selected start time. Worker nodes will need to be manually updated.';

const warningMessage: RegExp =
  /This cluster has a custom schedule which can not be modified from this page./;

const getHourRegexp = (hour: number): RegExp =>
  new RegExp(String.raw`${hour.toString().padStart(2, '0')}:00 UTC`);

describe('<UpgradeScheduleSelection />', () => {
  it('is accessible', async () => {
    const { container } = render(
      <UpgradeScheduleSelection
        input={{ value: '0 0 * * 0', onChange: jest.fn() }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    await checkAccessibility(container);
  });

  it('set day and hour selects values based on the value provided by props', async () => {
    render(
      <UpgradeScheduleSelection
        input={{ value: '0 11 * * 2', onChange: jest.fn() }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    expect(await screen.findByText('Select a day and start time')).toBeInTheDocument();
    expect(screen.getByText(infoAlert)).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText(/11:00 utc/i)).toBeInTheDocument();
  });

  it.each(days)(
    'properly formats day values: %i to "%s"',
    async (value: number, formattedValue: string) => {
      render(
        <UpgradeScheduleSelection
          input={{ value: `0 0 * * ${value}`, onChange: jest.fn() }}
          isDisabled={false}
          isHypershift={false}
        />,
      );

      expect(await screen.findByText(formattedValue)).toBeInTheDocument();
    },
  );

  it.each(hours)('properly formats hour values: %i to "%s"', async (value: number) => {
    render(
      <UpgradeScheduleSelection
        input={{ value: `0 ${value} * * 0`, onChange: jest.fn() }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    const regexp = getHourRegexp(value);
    expect(await screen.findByText(regexp)).toBeInTheDocument();
  });

  it('allows to change day', async () => {
    const onChange = jest.fn();
    const { user } = render(
      <UpgradeScheduleSelection
        input={{ value: '0 0 * * 0', onChange }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    expect(onChange).toHaveBeenCalledTimes(0);

    expect(await screen.findByText('Select a day and start time')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sunday' })).toBeInTheDocument();

    // Change day
    await user.click(screen.getByRole('button', { name: 'Sunday' }));
    await user.click(screen.getByRole('option', { name: 'Monday' }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('00 0 * * 1');
  });

  it('allows to change hour', async () => {
    const onChange = jest.fn();
    const { user } = render(
      <UpgradeScheduleSelection
        input={{ value: '0 0 * * 0', onChange }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    expect(onChange).toHaveBeenCalledTimes(0);

    expect(await screen.findByText('Select a day and start time')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /00:00 utc/i })).toBeInTheDocument();

    // Change hour
    await user.click(screen.getByRole('button', { name: /00:00 utc/i }));
    await user.click(screen.getByRole('option', { name: /04:00 utc/i }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('00 4 * * 0');
  });

  it('shows proper options for all possible days values', async () => {
    const { user } = render(
      <UpgradeScheduleSelection
        input={{ value: '0 0 * * 0', onChange: jest.fn() }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    expect(await screen.findByText('Sunday')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sunday' }));

    expect(screen.getAllByRole('option')).toHaveLength(days.length);

    days.forEach((day: [number, string]) => {
      expect(screen.getByRole('option', { name: day[1] })).toBeInTheDocument();
    });
  });

  it('shows proper options for all possible hours values', async () => {
    const { user } = render(
      <UpgradeScheduleSelection
        input={{ value: '0 0 * * 0', onChange: jest.fn() }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    expect(await screen.findByRole('button', { name: /00:00 utc/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /00:00 utc/i }));

    expect(screen.getAllByRole('option')).toHaveLength(hours.length);
    hours.forEach((value: [number, string]) => {
      const regexp = getHourRegexp(value[0]);
      expect(screen.getByRole('option', { name: regexp })).toBeInTheDocument();
    });
  });

  it('shows no default selection if no value is passed', () => {
    render(
      <UpgradeScheduleSelection
        input={{ value: '', onChange: jest.fn() }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Select day' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select hour' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sunday' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /00:00 utc/i })).not.toBeInTheDocument();
  });

  it('shows disabled selects when "isDisabled" is passed', () => {
    render(
      <UpgradeScheduleSelection
        input={{ value: '0 0 * * 0', onChange: jest.fn() }}
        isDisabled
        isHypershift={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Sunday' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sunday' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /00:00 utc/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /00:00 utc/i })).toBeDisabled();
  });

  it('shows a warning message if the cron value is not supported', async () => {
    const onChange = jest.fn();
    const { user } = render(
      <UpgradeScheduleSelection
        input={{ value: '0 * 14 * *', onChange }}
        isDisabled={false}
        isHypershift={false}
      />,
    );

    expect(screen.getByText(infoAlert)).toBeInTheDocument();
    expect(screen.getByText(warningMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'reset the schedule' })).toBeInTheDocument();

    expect(onChange).toHaveBeenCalledTimes(0);

    await user.click(screen.getByRole('button', { name: 'reset the schedule' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows a different alert title when "isHypershift" is passed', async () => {
    render(
      <UpgradeScheduleSelection
        input={{ value: '0 0 * * 0', onChange: jest.fn() }}
        isDisabled={false}
        isHypershift
      />,
    );

    expect(screen.getByText(infoAlertHypershift)).toBeInTheDocument();
    expect(screen.queryByText(infoAlert)).not.toBeInTheDocument();
  });
});
