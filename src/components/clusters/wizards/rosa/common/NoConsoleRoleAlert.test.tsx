import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { NoConsoleRoleAlert } from './NoConsoleRoleAlert';

describe('<NoConsoleRoleAlert />', () => {
  const onRefresh = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows the alert title', () => {
    render(<NoConsoleRoleAlert onRefresh={onRefresh} />);

    expect(screen.getByText('OCM role has limited permissions')).toBeInTheDocument();
  });

  it('shows the description and Learn more link', () => {
    render(<NoConsoleRoleAlert onRefresh={onRefresh} />);

    expect(screen.getByText(/created without console permissions/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Learn more about OCM role permissions' }),
    ).toBeInTheDocument();
  });

  it('calls onRefresh when Refresh OCM role is clicked', async () => {
    const { user } = render(<NoConsoleRoleAlert onRefresh={onRefresh} />);

    await user.click(screen.getByRole('button', { name: 'Refresh OCM role' }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables and shows loading on Refresh OCM role button when isRefreshPending is true', () => {
    render(<NoConsoleRoleAlert onRefresh={onRefresh} isRefreshPending />);

    expect(screen.getByRole('button', { name: /Refresh OCM role/i })).toBeDisabled();
  });

  it('does not disable Refresh OCM role button when isRefreshPending is false', () => {
    render(<NoConsoleRoleAlert onRefresh={onRefresh} isRefreshPending={false} />);

    expect(screen.getByRole('button', { name: 'Refresh OCM role' })).not.toBeDisabled();
  });

  it('is accessible', async () => {
    const { container } = render(<NoConsoleRoleAlert onRefresh={onRefresh} />);

    await checkAccessibility(container);
  });
});
