import React from 'react';
import dayjs from 'dayjs';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

import TransferOwnerStatus from './TransferOwnerStatus';

describe('TransferOwnerStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Popover shown on Pending staus', async () => {
    const now = dayjs.utc();
    const expirationTimestamp = now.add(5, 'day');
    const { container } = render(
      <TransferOwnerStatus
        status={ClusterTransferStatus.Pending}
        expirationTimestamp={expirationTimestamp.toISOString()}
        id="test-id"
        isOwner={false}
      />,
    );

    await checkAccessibility(container);
    expect(screen.getByText(`${ClusterTransferStatus.Pending} (5 days left)`)).toBeInTheDocument();

    await userEvent.click(screen.getByText(`${ClusterTransferStatus.Pending} (5 days left)`));
    expect(screen.getByRole('heading', { name: 'Transfer Ownership' })).toBeInTheDocument();
  });

  it('Transferring Popover shown on Accepted status', async () => {
    const now = dayjs.utc();
    const expirationTimestamp = now.add(5, 'day');

    render(
      <TransferOwnerStatus
        status={ClusterTransferStatus.Accepted}
        expirationTimestamp={expirationTimestamp.toISOString()}
        id="test-id"
        isOwner={false}
      />,
    );

    expect(screen.getByText('Transferring')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Transferring'));
    expect(screen.getByRole('heading', { name: 'Transfer in progress' })).toBeInTheDocument();
  });

  it('No expiration time is passed in', () => {
    render(
      <TransferOwnerStatus
        status={ClusterTransferStatus.Pending}
        expirationTimestamp={undefined}
        id="test-id"
        isOwner={false}
      />,
    );

    expect(
      screen.getByText(`${ClusterTransferStatus.Pending} (a few seconds left)`),
    ).toBeInTheDocument();

    expect(screen.queryByText('Transfer Ownership')).not.toBeInTheDocument();
  });
});
