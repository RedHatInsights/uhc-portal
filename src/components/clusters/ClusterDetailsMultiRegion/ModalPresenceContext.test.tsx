import React from 'react';

import { render, screen, waitFor } from '~/testUtils';

import { ModalPresenceProvider, useModalPresence } from './ModalPresenceContext';

const TestConsumer = () => {
  const { isAnyLocalModalOpen, registerModal, unregisterModal } = useModalPresence();

  return (
    <div>
      <span data-testid="modal-status">{isAnyLocalModalOpen ? 'open' : 'closed'}</span>
      <button data-testid="register" onClick={registerModal}>
        Register
      </button>
      <button data-testid="unregister" onClick={unregisterModal}>
        Unregister
      </button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <ModalPresenceProvider>
      <TestConsumer />
    </ModalPresenceProvider>,
  );

describe('ModalPresenceContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with no modals open', () => {
    // Arrange & Act
    renderWithProvider();

    // Assert
    expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
  });

  it('reports modal open after registerModal is called', async () => {
    // Arrange
    const { user } = renderWithProvider();

    // Act
    await user.click(screen.getByTestId('register'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('open');
    });
  });

  it('reports closed after unregisterModal is called', async () => {
    // Arrange
    const { user } = renderWithProvider();
    await user.click(screen.getByTestId('register'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('open');
    });

    // Act
    await user.click(screen.getByTestId('unregister'));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
    });
  });

  it('supports multiple simultaneous modals', async () => {
    // Arrange
    const { user } = renderWithProvider();

    // Act - register two modals
    await user.click(screen.getByTestId('register'));
    await user.click(screen.getByTestId('register'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('open');
    });

    // Assert - still open after first unregister
    await user.click(screen.getByTestId('unregister'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('open');
    });

    // Assert - closed after second unregister
    await user.click(screen.getByTestId('unregister'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
    });
  });

  it('does not go below zero when unregisterModal is called without a matching register', async () => {
    // Arrange
    const { user } = renderWithProvider();

    // Act - unregister with nothing registered
    await user.click(screen.getByTestId('unregister'));

    // Assert - still closed
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
    });

    // Verify a subsequent register still works
    await user.click(screen.getByTestId('register'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-status')).toHaveTextContent('open');
    });
  });

  it('returns default values when used outside the provider', () => {
    // Arrange & Act
    render(<TestConsumer />);

    // Assert
    expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
  });
});
