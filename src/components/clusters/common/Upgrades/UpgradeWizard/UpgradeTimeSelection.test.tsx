import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import UpgradeTimeSelection from './UpgradeTimeSelection';

describe('<UpgradeTimeSelection />', () => {
  const mockOnSet = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(
      <UpgradeTimeSelection type="now" timestamp="" onSet={mockOnSet} />,
    );

    await checkAccessibility(container);
  });

  it('displays the options', () => {
    render(<UpgradeTimeSelection type="now" timestamp="" onSet={mockOnSet} />);

    expect(screen.getByText('Schedule update')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Update now/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Schedule a different time/i })).toBeInTheDocument();
  });

  it('checks update now by default', () => {
    render(<UpgradeTimeSelection type="now" timestamp="" onSet={mockOnSet} />);

    expect(screen.getByRole('radio', { name: /Update now/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Schedule a different time/i })).not.toBeChecked();
  });

  it('displays date picker when type is time', async () => {
    render(<UpgradeTimeSelection type="time" timestamp="" onSet={mockOnSet} />);

    expect(screen.getByRole('radio', { name: /Schedule a different time/i })).toBeChecked();
    expect(screen.getByPlaceholderText('YYYY-MM-DD')).toBeInTheDocument();
  });

  it('validates for date in the past', async () => {
    const { user } = render(
      <UpgradeTimeSelection type="time" timestamp="2025-06-06T22:00:00.000Z" onSet={mockOnSet} />,
    );

    const radioButton = screen.getByRole('radio', { name: /Schedule a different time/i });
    expect(radioButton).toBeChecked();
    expect(screen.getByText('06 Jun 2025 22:00 UTC')).toBeInTheDocument();
    await user.click(radioButton);

    expect(
      screen.getByText('The selected date is before the allowable range.'),
    ).toBeInTheDocument();
  });

  it('validates for date too far in future', async () => {
    const { user } = render(
      <UpgradeTimeSelection type="time" timestamp="2025-06-06T22:00:00.000Z" onSet={mockOnSet} />,
    );

    const radioButton = screen.getByRole('radio', { name: /Schedule a different time/i });
    expect(radioButton).toBeChecked();
    await user.clear(screen.getByPlaceholderText('YYYY-MM-DD'));
    await user.type(screen.getByPlaceholderText('YYYY-MM-DD'), '4000-06-06');
    await user.click(radioButton);

    await user.click(radioButton);

    expect(screen.getByText('The selected date is after the allowable range.')).toBeInTheDocument();
  });

  it('validates for incorrect date format', async () => {
    const { user } = render(
      <UpgradeTimeSelection type="time" timestamp="2025-06-06T22:00:00.000Z" onSet={mockOnSet} />,
    );

    const radioButton = screen.getByRole('radio', { name: /Schedule a different time/i });
    expect(radioButton).toBeChecked();
    await user.type(screen.getByPlaceholderText('YYYY-MM-DD'), 'abcdef');
    await user.click(radioButton);

    expect(screen.getByText("Invalid date format. Use 'YYYY-MM-DD' format.")).toBeInTheDocument();
  });

  it('displays 30 minute and 00 minute time options', async () => {
    const { user } = render(
      <UpgradeTimeSelection type="time" timestamp="2025-06-06T22:00:00.000Z" onSet={mockOnSet} />,
    );

    const radioButton = screen.getByRole('radio', { name: /Schedule a different time/i });
    expect(radioButton).toBeChecked();
    await user.click(radioButton);

    const timeSelectButton = screen.getByRole('button', { name: /Upgrade time menu/i });

    await user.click(timeSelectButton);
    expect(screen.getByText('14:00')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('15:30')).toBeInTheDocument();
    expect(screen.getByText('16:00')).toBeInTheDocument();
    expect(screen.getByText('16:30')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
    expect(screen.getByText('17:30')).toBeInTheDocument();
  });
});
