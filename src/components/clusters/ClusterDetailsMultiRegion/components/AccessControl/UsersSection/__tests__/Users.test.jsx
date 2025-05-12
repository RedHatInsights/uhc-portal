import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

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

    expect(container.querySelectorAll('.pf-v5-c-skeleton').length).toBeGreaterThan(0);
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
  });
});
