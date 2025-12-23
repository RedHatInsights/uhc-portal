import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

import { TransferOwnerPendingAlert } from './TransferOwnerPendingAlert';

jest.mock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails',
);

const mockUseFetchClusterTransferDetail = jest.requireMock(
  '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails',
).useFetchClusterTransferDetail;

describe('TransferOwnerPendingAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([[undefined], [0]])('%p total', (total: undefined | number) => {
    // Arrange
    const items = total ? Array(total).fill({ status: ClusterTransferStatus.Pending }) : undefined;
    mockUseFetchClusterTransferDetail.mockReturnValue({ data: { items } });

    // Act
    render(
      <div data-testid="parent-div">
        <TransferOwnerPendingAlert />
      </div>,
    );

    // Assert
    expect(screen.getByTestId('parent-div').children.length).toBe(0);
  });

  it('is accessible', async () => {
    // Arrange
    mockUseFetchClusterTransferDetail.mockReturnValue({
      data: { items: [{ status: ClusterTransferStatus.Pending }] },
    });

    // Act
    const { container } = render(<TransferOwnerPendingAlert />);

    // Assert
    await checkAccessibility(container);
  });

  describe('is properly rendering', () => {
    it.each([
      [1, /pending cluster transfer ownership request/i],
      [2, /pending cluster transfer ownership requests/i],
    ])('total %p', (total: number, expectedText: RegExp) => {
      // Arrange
      const items = Array(total).fill({ status: ClusterTransferStatus.Pending });
      mockUseFetchClusterTransferDetail.mockReturnValue({ data: { items } });

      // Act
      render(<TransferOwnerPendingAlert />);

      // Assert
      expect(
        screen.getByRole('heading', {
          name: /warning alert: pending transfer requests/i,
        }),
      ).toBeInTheDocument();
      expect(screen.getByText(expectedText)).toBeInTheDocument();
      expect(
        screen.queryByRole('link', {
          name: /show pending transfer requests/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
