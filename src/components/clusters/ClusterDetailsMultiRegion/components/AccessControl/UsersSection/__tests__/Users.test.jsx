import React from 'react';

import { checkAccessibility, render, screen, within } from '~/testUtils';

import links from '../../../../../../../common/installLinks.mjs';
import { useFetchUsers } from '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchUsers';
import fixtures from '../../../../__tests__/ClusterDetails.fixtures';
import { initialState } from '../UsersReducer';
import UsersSection from '../UsersSection';

import { users } from './Users.fixtures';

jest.mock(
  '../../../../../../../queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchUsers',
  () => ({
    useFetchUsers: jest.fn(),
    refetchUsers: jest.fn(),
  }),
);

describe('<Users />', () => {
  const getUsers = jest.fn();
  const props = {
    cluster: fixtures.clusterDetails.cluster,
    getUsers,
    deleteUser: jest.fn(),
    addUser: jest.fn(),
    openModal: jest.fn(),
    closeModal: jest.fn(),
    clearUsersResponses: jest.fn(),
    clearAddUserResponses: jest.fn(),
    clusterGroupUsers: { ...initialState.groupUsers, users: [] },
    addUserResponse: initialState.addUserResponse,
    deleteUserResponse: initialState.deleteUserResponse,
    hasUsers: false,
    isAddUserModalOpen: false,
    canAddClusterAdmin: false,
    clusterHibernating: false,
    isReadOnly: false,
    isHypershift: false,
    isROSA: true,
  };
  afterEach(() => {
    getUsers.mockClear();
  });
  const useFetchUsersMock = useFetchUsers;
  it('shows skeleton while loading', async () => {
    useFetchUsersMock.mockReturnValue({
      data: [],
      isLoading: true,
      osError: false,
      error: null,
      isRefetching: true,
    });

    const { container } = render(<UsersSection {...props} />);

    expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBeGreaterThan(0);
  });
  it('is accessible without users', async () => {
    useFetchUsersMock.mockReturnValue({
      data: [],
      isLoading: false,
      osError: false,
      error: null,
    });
    const { container } = render(<UsersSection {...props} />);
    expect(useFetchUsersMock).toHaveBeenCalled();
    await checkAccessibility(container);
  });

  describe('with users', () => {
    afterEach(() => {
      getUsers.mockClear();
    });

    it('is accessible', async () => {
      useFetchUsersMock.mockReturnValue({
        data: {
          users,
        },
        isLoading: false,
        osError: false,
        error: null,
      });
      const { container } = render(<UsersSection {...props} />);
      expect(useFetchUsersMock).toHaveBeenCalled();
      expect(await screen.findAllByRole('cell', { name: 'dedicated-admins' })).toHaveLength(2);
      expect(screen.getAllByRole('cell', { name: 'cluster-admins' })).toHaveLength(2);
      await checkAccessibility(container);
    });

    it('should show confirmation dialog when deleting a user', async () => {
      useFetchUsersMock.mockReturnValue({
        data: {
          users,
        },
        isLoading: false,
        osError: false,
        error: null,
      });
      const { user } = render(<UsersSection {...props} />);
      expect(useFetchUsersMock).toHaveBeenCalled();
      const row1 = screen.getByRole('row', { name: /u1/ });
      await user.click(within(row1).getByRole('button', { name: 'Kebab toggle' }));
      expect(await screen.findByRole('menuitem', { name: 'Delete' })).toBeEnabled();
      await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
      expect(
        await screen.findByRole('dialog', { name: 'Are you sure you want to delete this user?' }),
      ).toBeVisible();
      expect(await screen.findByRole('button', { name: 'Delete' })).toBeEnabled();
      expect(await screen.findByRole('button', { name: 'Cancel' })).toBeEnabled();
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    });
  });

  describe('Documentation link', () => {
    it('renders classic link when cluster is rosa classic', async () => {
      useFetchUsersMock.mockReturnValue({
        data: {
          users,
        },
        isLoading: false,
        osError: false,
        error: null,
      });

      render(<UsersSection {...props} isROSA />);

      const link = screen.getByText('Learn more.');
      expect(link).toHaveAttribute('href', links.ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES);
    });

    it('renders HCP link when cluster is HCP', async () => {
      useFetchUsersMock.mockReturnValue({
        data: {
          users,
        },
        isLoading: false,
        osError: false,
        error: null,
      });

      render(<UsersSection {...props} isROSA isHypershift />);

      const link = screen.getByText('Learn more.');
      expect(link).toHaveAttribute('href', links.ROSA_AWS_IAM_OPERATOR_ROLES);
    });
  });
});
