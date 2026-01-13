import React from 'react';

import { useFetchOCMRoles } from '~/queries/ClusterDetailsQueries/AccessControlTab/OCMRolesQueries/useFetchOCMRoles';
import { render, screen, waitFor, within } from '~/testUtils';
import { Subscription } from '~/types/accounts_mgmt.v1';

import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import OCMRolesSection from '../OCMRolesSection';

import { OCMRoles } from './OCMRolesSection.fixture';

jest.mock(
  '~/queries/ClusterDetailsQueries/AccessControlTab/OCMRolesQueries/useFetchOCMRoles',
  () => ({
    useFetchOCMRoles: jest.fn(),
    refetchOcmRoles: jest.fn(),
  }),
);

describe('<OCMRolesSection />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const useFetchOCMRolesMock = useFetchOCMRoles as jest.Mock;

  const { subscription } = fixtures.clusterDetails.cluster;
  const props = {
    subscription: subscription as unknown as Subscription,
    canEditOCMRoles: true,
    canViewOCMRoles: true,
  };

  it('shows skeleton while loading', async () => {
    useFetchOCMRolesMock.mockReturnValue({
      data: OCMRoles.data,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: true,
    });

    const { container } = render(<OCMRolesSection {...props} />);

    expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBeGreaterThan(0);
  });

  it('should render', async () => {
    useFetchOCMRolesMock.mockReturnValue({
      data: OCMRoles.data,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    });

    const { user } = render(<OCMRolesSection {...props} />);
    expect(useFetchOCMRolesMock).toHaveBeenCalledTimes(2);

    await screen.findByRole('grid', { name: 'OCM Roles and Access' });
    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Grant role' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    const row1 = screen.getByRole('row', { name: /Doris Hudson/ });
    within(row1).getByRole('cell', { name: 'Cluster editor' });

    await user.click(within(row1).getByRole('button', { name: 'Kebab toggle' }));
    expect(await screen.findByRole('menuitem', { name: 'Delete' })).toBeEnabled();
    const row2 = screen.getByRole('row', { name: /Jak Valdez/ });
    within(row2).getByRole('cell', { name: 'Cluster viewer' });
    const row3 = screen.getByRole('row', { name: /Olive1/ });
    within(row3).getByRole('cell', { name: 'Machine pool editor' });
    const row4 = screen.getByRole('row', { name: /Plum/ });
    within(row4).getByRole('cell', { name: 'Identity provider editor' });
  });

  it('should show confirmation dialog when deleting a role', async () => {
    useFetchOCMRolesMock.mockReturnValue({
      data: OCMRoles.data,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    });
    const { user } = render(<OCMRolesSection {...props} />);
    const row1 = screen.getByRole('row', { name: /Doris Hudson/ });
    await user.click(within(row1).getByRole('button', { name: 'Kebab toggle' }));
    expect(await screen.findByRole('menuitem', { name: 'Delete' })).toBeEnabled();
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(
      await screen.findByRole('dialog', { name: 'Are you sure you want to delete this role?' }),
    ).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Delete' })).toBeEnabled();
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeEnabled();
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(screen.getAllByRole('row')).toHaveLength(5);
  });

  it('should disable buttons if no edit access', async () => {
    useFetchOCMRolesMock.mockReturnValue({
      data: OCMRoles.data,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    });

    const { findByRole } = render(<OCMRolesSection {...props} canEditOCMRoles={false} />);
    expect(useFetchOCMRolesMock).toHaveBeenCalledTimes(2);

    expect(await findByRole('button', { name: 'Grant role' })).toHaveAttribute('aria-disabled');
    const row1 = await findByRole('row', { name: /Doris Hudson/ });
    within(row1).getByRole('cell', { name: /cluster editor/i });
    expect(within(row1).getByRole('button', { name: 'Kebab toggle' })).toBeDisabled();
  });

  it('should render error', async () => {
    const errorResp = {
      errorCode: 'ACCT-MGMT-11',
      href: '/api/accounts_mgmt/v1/errors/11',
      id: '11',
      kind: 'Error',
      operationID: 'abcdef',
      reason:
        'Account with ID 123456 denied access to perform get on Subscription with HTTP call GET /api/accounts_mgmt/v1/subscriptions/7890/role_bindings',
    };
    useFetchOCMRolesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { error: errorResp },
      isSuccess: false,
    });

    const { getByTestId } = render(<OCMRolesSection {...props} />);
    expect(useFetchOCMRolesMock).toHaveBeenCalledTimes(2);

    await waitFor(() => expect(getByTestId('alert-error')).toBeVisible());
    const alert = getByTestId('alert-error');

    within(alert).getByRole('heading', { name: /error getting OCM roles and access/i });
    within(alert).getByText(/ACCT-MGMT-11/);
    within(alert).getByText(/Account with ID 123456 denied access to perform get/);
  });
});
