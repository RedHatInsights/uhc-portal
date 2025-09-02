import React from 'react';

import { render, screen } from '~/testUtils';

import { RefreshClusterVPCAlert } from '../common/RefreshClusterVPCAlert';

describe('RefreshClusterVPCAlert', () => {
  const refreshVPCMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it.each([
    [undefined, "Please try refreshing the Cluster's VPC."],
    ['', "Please try refreshing the Cluster's VPC."],
    ['whatever the error reason', 'whatever the error reason'],
  ])(
    'it properly renders. errorReason: %p',
    (errorReason: string | undefined, expected: string) => {
      // Act
      render(
        <RefreshClusterVPCAlert
          isLoading={false}
          refreshVPC={refreshVPCMock}
          errorReason={errorReason}
        />,
      );

      // Assert
      const text = screen.getByText(expected);
      expect(text).toBeInTheDocument();
      expect(text.innerHTML.startsWith(`${expected}<br><button`)).toBe(true);

      expect(
        screen.getByRole('heading', {
          name: /failed to load machine pool vpc\./i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: /refretch cluster's vpc/i,
        }),
      ).toBeInTheDocument();
    },
  );

  it('button is working', async () => {
    // Arrange
    const { user } = render(
      <RefreshClusterVPCAlert isLoading={false} refreshVPC={refreshVPCMock} />,
    );
    const button = screen.getByRole('button', {
      name: /refretch cluster's vpc/i,
    });
    expect(refreshVPCMock).toHaveBeenCalledTimes(0);

    // Act
    await user.click(button);

    // Assert
    expect(refreshVPCMock).toHaveBeenCalledTimes(1);
  });

  it('is loading', () => {
    // Act
    render(<RefreshClusterVPCAlert isLoading refreshVPC={refreshVPCMock} />);

    // Assert
    expect(
      screen.getByRole('button', {
        name: /loading\.\.\. refretch cluster's vpc/i,
      }),
    ).toBeInTheDocument();
  });
});
