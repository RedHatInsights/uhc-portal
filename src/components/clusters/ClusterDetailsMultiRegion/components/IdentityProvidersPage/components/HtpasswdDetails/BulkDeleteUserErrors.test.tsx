import React from 'react';

import { render, screen } from '~/testUtils';

import BulkDeleteUserErrors from './BulkDeleteUserErrors';

describe('<BulkDeleteUserErrors />', () => {
  it('shows a summary of failed usernames and collapsed per-user details', async () => {
    const { user } = render(
      <BulkDeleteUserErrors
        failedDeletions={[
          {
            username: 'user1',
            userId: 'userId1',
            error: {
              errorMessage: 'Permission denied',
              operationID: 'op-1',
            },
          },
          {
            username: 'user2',
            userId: 'userId2',
            error: {
              errorMessage: 'User not found',
              operationID: 'op-2',
            },
          },
        ]}
      />,
    );

    expect(
      screen.getByText('A problem occurred while deleting the following htpasswd users.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('user1, user2');
    expect(screen.getByRole('button', { name: 'user1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'user2' })).toBeInTheDocument();
    expect(screen.getByText('Permission denied')).not.toBeVisible();
    expect(screen.getByText('User not found')).not.toBeVisible();

    await user.click(screen.getByRole('button', { name: 'user1' }));
    expect(screen.getByText('Permission denied')).toBeVisible();
    expect(screen.getByText('Operation ID: op-1')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'user2' }));
    expect(screen.getByText('User not found')).toBeVisible();
    expect(screen.getByText('Operation ID: op-2')).toBeVisible();
  });

  it('falls back to Unknown user when a failure has no username', () => {
    render(
      <BulkDeleteUserErrors
        failedDeletions={[
          {
            userId: 'userId1',
            error: {
              errorMessage: 'Permission denied',
              operationID: 'op-1',
            },
          },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Unknown user' })).toBeInTheDocument();
  });
});
