import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import { TransferOwnerPendingAlert } from './TransferOwnerPendingAlert';

describe('TransferOwnerPendingAlert', () => {
  it.each([[undefined], [0]])('%p total', (total: undefined | number) => {
    render(
      <div data-testid="parent-div">
        <TransferOwnerPendingAlert total={total} />
      </div>,
    );
    expect(screen.getByTestId('parent-div').children.length).toBe(0);
  });

  it.each([[undefined], ['whateverthelink']])(
    'is accessible. %p link',
    async (link: undefined | string) => {
      // Act
      const { container } = render(<TransferOwnerPendingAlert total={1} />);

      // Assert
      await checkAccessibility(container);
    },
  );

  describe('is properly rendering', () => {
    it.each([
      [1, /pending cluster transfer ownership request/i],
      [2, /pending cluster transfer ownership requests/i],
    ])('total %p', (total: number, expectedText: RegExp) => {
      // Act
      render(<TransferOwnerPendingAlert total={total} />);

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
