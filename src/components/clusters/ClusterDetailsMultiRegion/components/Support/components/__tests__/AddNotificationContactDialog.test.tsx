import React from 'react';
import * as reactRedux from 'react-redux';

import { defaultClusterFromSubscription } from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import { closeModal } from '~/components/common/Modal/ModalActions';
import { addNotificationContact } from '~/redux/actions/supportActions';
import { useGlobalState } from '~/redux/hooks';
import { checkAccessibility, render, screen, userEvent, waitFor } from '~/testUtils';

import AddNotificationContactDialog from '../AddNotificationContactDialog';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/redux/actions/supportActions', () => ({
  addNotificationContact: jest.fn(),
  clearAddNotificationContacts: jest.fn(),
}));

jest.mock('~/components/common/Modal/ModalActions', () => ({
  closeModal: jest.fn(),
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const useGlobalStateMock = useGlobalState as jest.Mock;
const addNotificationContactMock = addNotificationContact as jest.Mock;
const closeModalMock = closeModal as jest.Mock;
const addNotificationMutation = jest.fn();

describe('<AddNotificationContactDialog />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const isAddNotificationContactSuccessMock = true;
  const isAddNotificationContactPendingMock = false;
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);
  const defaultProps = {
    addNotificationMutation,
    isAddNotificationContactSuccess: isAddNotificationContactSuccessMock,
    isAddNotificationContactPending: isAddNotificationContactPendingMock,
    addNotificationContactError: undefined,
  };
  it('empty content', () => {
    // Arrange
    useGlobalStateMock.mockReturnValueOnce(false);

    // Act
    render(
      <div data-testid="parent-div">
        <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />
      </div>,
    );

    // Assert
    expect(screen.getByTestId('parent-div').children.length).toBe(0);
  });

  it('is accessible. Empty Content', async () => {
    // Arrange
    useGlobalStateMock.mockReturnValueOnce(false);

    // Act
    const { container } = render(
      <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />,
    );

    // Assert
    await checkAccessibility(container);
  });

  it('is accessible. With Content', async () => {
    // Arrange
    useGlobalStateMock.mockReturnValueOnce(true);

    // Act
    const { container } = render(
      <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />,
    );

    // Assert
    await checkAccessibility(container);
  });

  it('renders what it is expected', () => {
    // Arrange
    useGlobalStateMock.mockReturnValueOnce(true);

    // Act
    render(
      <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />,
    );

    // Assert
    expect(screen.getByText(/add notification contact/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add contact/i })).toHaveAttribute('disabled');
    expect(addNotificationContactMock).toHaveBeenCalledTimes(0);
  });

  it('after typing username', async () => {
    // Arrange
    const inputValue = 'whatever';
    // Use mockReturnValue to ensure modal stays open for all renders during typing
    useGlobalStateMock.mockReturnValue(true);

    render(
      <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />,
    );

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /user name/i }), inputValue);

    // Assert
    expect(screen.getByRole('button', { name: /add contact/i })).not.toHaveAttribute('disabled');
  });

  it('invalid typing', async () => {
    // Arrange
    const inputValue = '#@~#@~#@~#';
    // Use mockReturnValue to ensure modal stays open for all renders during typing
    useGlobalStateMock.mockReturnValue(true);

    render(
      <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />,
    );

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /user name/i }), inputValue);

    // Assert
    expect(screen.getByRole('button', { name: /add contact/i })).toHaveAttribute('disabled');
    expect(screen.getByText(/username includes illegal symbols/i)).toBeInTheDocument();
  });

  it('clicks on Add Contact button', async () => {
    // Arrange
    const inputValue = 'whatever';

    // +2 because the click
    for (let i = 0; i < inputValue.length + 2; i += 1) {
      useGlobalStateMock.mockReturnValueOnce(true);
    }

    const { user } = render(
      <AddNotificationContactDialog
        cluster={{
          ...defaultClusterFromSubscription,
          subscription: {
            ...defaultClusterFromSubscription.subscription,
            id: 'subscriptionId',
            managed: false,
          },
        }}
        {...defaultProps}
      />,
    );

    // Act
    await userEvent.type(screen.getByRole('textbox', { name: /user name/i }), inputValue);

    // Act
    await user.click(screen.getByRole('button', { name: /add contact/i }));

    // Assert
    expect(addNotificationMutation).toHaveBeenCalledTimes(1);
    expect(addNotificationMutation).toHaveBeenCalledWith(inputValue);
  });

  it('clicks on Cancel button', async () => {
    // Arrange
    useGlobalStateMock.mockReturnValueOnce(true);

    const { user } = render(
      <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Assert
    expect(addNotificationContactMock).toHaveBeenCalledTimes(0);
    expect(closeModalMock).toHaveBeenCalledTimes(2);
  });

  it('clicks on close button', async () => {
    // Arrange
    useGlobalStateMock.mockReturnValueOnce(true);

    const { user } = render(
      <AddNotificationContactDialog cluster={defaultClusterFromSubscription} {...defaultProps} />,
    );

    // Act
    await waitFor(() => {
      user.click(screen.getByRole('button', { name: /close/i }));
    });

    // Assert
    expect(addNotificationContactMock).toHaveBeenCalledTimes(0);
    expect(closeModalMock).toHaveBeenCalledTimes(2);
  });
});
