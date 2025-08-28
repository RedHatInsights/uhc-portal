import React from 'react';
import type axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { render, screen } from '~/testUtils';

import { RevokeBreakGlassCredentialsModal } from '../RevokeBreakGlassCredentialsModal';

jest.mock('~/components/common/Modal/ModalActions');
const mockModalData = {
  clusterId: 'cluster1',
  credential: {
    id: 'user1',
    username: 'user',
    expiration_timestamp: '2022-01-01T00:00:00Z',
  },
  onClose: jest.fn(),
};
type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('<RevokeBreakGlassCredentialsModal />', () => {
  it('should show correct title and content', async () => {
    render(
      <RevokeBreakGlassCredentialsModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );

    expect(screen.queryByText(/Revoke all credentials for cluster/i)).toBeInTheDocument();
    expect(
      screen.queryByText(
        /This action cannot be undone. It will permanently revoke all credentials./i,
      ),
    ).toBeInTheDocument();
  });
  it('revoke button is enabled', () => {
    render(
      <RevokeBreakGlassCredentialsModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );
    expect(screen.getByRole('button', { name: 'Revoke all' })).not.toHaveAttribute('aria-disabled');
  });

  it('closes modal on cancel', async () => {
    const { user } = render(
      <RevokeBreakGlassCredentialsModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockModalData.onClose).toHaveBeenCalled();
  });

  it('calls delete function on confirm', async () => {
    const { user } = render(
      <RevokeBreakGlassCredentialsModal
        clusterId={mockModalData.clusterId}
        onClose={mockModalData.onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Revoke all' }));
    apiRequestMock.delete.mockResolvedValue({
      kind: 'BreakGlassCredential',
      id: mockModalData.credential.id,
      href: 'none',
      code: 'none',
      reason: 'none',
      details: {
        additionalProp1: {},
      },
    });
    expect(apiRequest.delete).toHaveBeenCalledTimes(1);
    expect(apiRequest.delete).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/cluster1/break_glass_credentials',
    );
  });
});
