import React from 'react';

import { useDeleteIdentityProvider } from '~/queries/ClusterDetailsQueries/IDPPage/useDeleteIdentityProvider';
import { screen, userEvent, withState } from '~/testUtils';

import DeleteIDPDialog from './DeleteIDPDialog';

jest.mock('~/queries/ClusterDetailsQueries/IDPPage/useDeleteIdentityProvider', () => ({
  useDeleteIdentityProvider: jest.fn(),
}));

const refreshParent = jest.fn();
const props = {
  refreshParent,
};

describe('DeleteIDPDialog', () => {
  const initialState = {
    modal: {
      modalName: 'delete-idp',
      data: {
        clusterID: 'myclusterid',
        idpID: 'id1',
        idpName: 'hello',
        idpType: 'GithubIdentityProvider',
        region: 'us-east-1',
      },
    },
  };

  const mutateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDeleteIdentityProvider.mockReturnValue({
      isPending: false,
      isError: false,
      error: false,
      mutate: mutateMock,
    });
  });

  it('Should call delete IDP on Remove click', async () => {
    mutateMock.mockImplementation((_idpID, { onSuccess }) => {
      onSuccess();
    });
    withState(initialState, false).render(<DeleteIDPDialog {...props} />);

    const removeButton = screen.getByRole('button', { name: /Remove/i });
    expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith('id1', { onSuccess: expect.any(Function) });
  });
});
