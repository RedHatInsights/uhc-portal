import React from 'react';
import type axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { render, screen } from '~/testUtils';

import { DeleteExternalAuthProviderModal } from '../DeleteExternalAuthProviderModal';

jest.mock('~/components/common/Modal/ModalActions');
const mockModalData = {
  clusterId: 'cluster1',
  externalAuthProvider: {
    id: 'myprovider1',
    issuer: { url: 'https:redhat.com', audiences: ['abc'] },
    claim: { mappings: { username: { claim: 'email' }, groups: { claim: 'groups' } } },
  },
  onClose: jest.fn(),
};
type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('<DeleteExternalAuthProviderModal />', () => {
  it('should show correct title and content', async () => {
    render(
      <DeleteExternalAuthProviderModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
        externalAuthProvider={mockModalData.externalAuthProvider}
      />,
    );

    expect(screen.queryByText(/Delete provider/i)).toBeInTheDocument();
    expect(
      screen.queryByText(
        /This action cannot be undone. It will permanently remove the external authentication provider/i,
      ),
    ).toBeInTheDocument();
  });
  it('delete button is initially disabled', () => {
    render(
      <DeleteExternalAuthProviderModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
        externalAuthProvider={mockModalData.externalAuthProvider}
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeEnabled();
  });

  it('closes modal on cancel', async () => {
    const { user } = render(
      <DeleteExternalAuthProviderModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
        externalAuthProvider={mockModalData.externalAuthProvider}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockModalData.onClose).toHaveBeenCalled();
  });

  it('enables delete button on text input', async () => {
    const { user } = render(
      <DeleteExternalAuthProviderModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
        externalAuthProvider={mockModalData.externalAuthProvider}
      />,
    );
    await user.type(screen.getByRole('textbox'), 'wrong_name');

    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeEnabled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'myprovider1');

    expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveAttribute('aria-disabled');
  });

  it('calls delete function on confirm', async () => {
    const { user } = render(
      <DeleteExternalAuthProviderModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
        externalAuthProvider={mockModalData.externalAuthProvider}
      />,
    );
    await user.type(screen.getByRole('textbox'), 'myprovider1');

    expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveAttribute('aria-disabled');

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    apiRequestMock.delete.mockResolvedValue({
      kind: 'ExternalAuth',
      id: mockModalData.externalAuthProvider.id,
      href: 'none',
      code: 'none',
      reason: 'none',
      details: {
        additionalProp1: {},
      },
    });
    expect(apiRequest.delete).toHaveBeenCalledTimes(1);
    expect(apiRequest.delete).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/cluster1/external_auth_config/external_auths/myprovider1',
    );
  });
});
