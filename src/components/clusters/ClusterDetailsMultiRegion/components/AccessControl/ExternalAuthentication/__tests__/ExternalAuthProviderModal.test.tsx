import React from 'react';
import type axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { render, screen } from '~/testUtils';

import { ExternalAuthProviderModal } from '../ExternalAuthProviderModal';

jest.mock('~/components/common/Modal/ModalActions');
const mockModalData = {
  clusterId: 'cluster1',
  provider: {
    id: 'myprovider1',
    issuer: { url: 'https://redhat.com', audiences: ['abc'] },
    claim: { mappings: { username: { claim: 'email' }, groups: { claim: 'groups' } } },
  },
  onClose: jest.fn(),
  isEdit: false,
};
type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('<ExternalAuthProviderModal />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should show correct title and content', async () => {
    render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );

    expect(screen.queryByText(/Add external authentication provider/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/An external authentication provider controls access to your cluster/i),
    ).toBeInTheDocument();
  });
  it('ask for name and url', () => {
    render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Issuer URL' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Audiences' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Groups mapping' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Username mapping' })).toBeInTheDocument();
  });

  it('closes modal on cancel', async () => {
    const { user } = render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockModalData.onClose).toHaveBeenCalled();
  });

  it('disables Add until the user changes the form', () => {
    render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('disables Save until the form is edited', async () => {
    const { user } = render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
        externalAuthProvider={mockModalData.provider as any}
        isEdit
      />,
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: 'Issuer URL' }), 'x');

    expect(saveButton).not.toBeDisabled();
  });

  it('disables Save when the form is dirty but has validation errors', async () => {
    const { user } = render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
        externalAuthProvider={mockModalData.provider as any}
        isEdit
      />,
    );

    const issuerInput = screen.getByRole('textbox', { name: 'Issuer URL' });
    await user.clear(issuerInput);
    await user.type(issuerInput, 'http://redhat.com');
    await user.tab();

    expect(await screen.findByText('URL must be https')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Issuer URL' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('calls post api on Add', async () => {
    const apiReturnValue = {
      data: {
        id: 'myprovider1',
        issuer: { url: 'https://redhat.com', audiences: ['abc'] },
        claim: { mappings: { username: { claim: 'email' }, groups: { claim: 'groups' } } },
      },
    };
    apiRequestMock.post.mockResolvedValue(apiReturnValue);

    const { user } = render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'myprovider1');
    await user.type(screen.getByRole('textbox', { name: 'Issuer URL' }), 'https://redhat.com');
    await user.type(screen.getByRole('textbox', { name: 'Audiences' }), 'abc');
    await user.type(screen.getByRole('textbox', { name: 'Groups mapping' }), 'groups');
    await user.type(screen.getByRole('textbox', { name: 'Username mapping' }), 'email');

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(apiRequest.post).toHaveBeenCalledTimes(1);
    const mockPostBreakGlassCallParams = apiRequestMock.post.mock.calls[0];
    expect(mockPostBreakGlassCallParams[0]).toBe(
      '/api/clusters_mgmt/v1/clusters/cluster1/external_auth_config/external_auths',
    );
  }, 80_000);

  it('Adding console client, client ID must be in audience', async () => {
    const { user } = render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'myprovider1');
    await user.type(screen.getByRole('textbox', { name: 'Issuer URL' }), 'https://redhat.com');
    await user.type(screen.getByRole('textbox', { name: 'Audiences' }), 'abc,def');
    await user.type(screen.getByRole('textbox', { name: 'Groups mapping' }), 'groups');
    await user.type(screen.getByRole('textbox', { name: 'Username mapping' }), 'email');
    await user.type(screen.getByRole('textbox', { name: 'Console client ID' }), 'notthere');
    await user.type(screen.getByRole('textbox', { name: 'Console client secret' }), 'thissecret');

    expect(screen.queryByText(/Client ID must be a member of the audiences/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  }, 80_000);

  it('calls post api on Add including console client', async () => {
    const apiReturnValue = {
      data: {
        id: 'myprovider1',
        issuer: { url: 'https://redhat.com', audiences: ['abc'] },
        claim: { mappings: { username: { claim: 'email' }, groups: { claim: 'groups' } } },
      },
    };
    apiRequestMock.post.mockResolvedValue(apiReturnValue);

    const { user } = render(
      <ExternalAuthProviderModal
        clusterID={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'myprovider1');
    await user.type(screen.getByRole('textbox', { name: 'Issuer URL' }), 'https://redhat.com');
    await user.type(screen.getByRole('textbox', { name: 'Audiences' }), 'abc,def');
    await user.type(screen.getByRole('textbox', { name: 'Groups mapping' }), 'groups');
    await user.type(screen.getByRole('textbox', { name: 'Username mapping' }), 'email');
    await user.type(screen.getByRole('textbox', { name: 'Console client ID' }), 'def');
    await user.type(screen.getByRole('textbox', { name: 'Console client secret' }), 'thissecret');

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(apiRequest.post).toHaveBeenCalledTimes(1);
    const mockPostBreakGlassCallParams = apiRequestMock.post.mock.calls[0];
    expect(mockPostBreakGlassCallParams[0]).toBe(
      '/api/clusters_mgmt/v1/clusters/cluster1/external_auth_config/external_auths',
    );
  }, 80_000);
});
