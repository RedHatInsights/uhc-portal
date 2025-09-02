import React from 'react';
import * as reactRedux from 'react-redux';

import * as notifications from '@redhat-cloud-services/frontend-components-notifications';

import { useDeleteNotificationContact } from '~/queries/ClusterDetailsQueries/ClusterSupportTab/useDeleteNotificationContact';
import { useFetchNotificationContacts } from '~/queries/ClusterDetailsQueries/ClusterSupportTab/useFetchNotificationContacts';
import { clearDeleteNotificationContacts } from '~/redux/actions/supportActions';
import { act, checkAccessibility, render, screen } from '~/testUtils';

import NotificationContactsCard from '../NotificationContactsCard';

jest.mock('~/queries/ClusterDetailsQueries/ClusterSupportTab/useFetchNotificationContacts', () => ({
  useFetchNotificationContacts: jest.fn(),
}));
jest.mock('~/queries/ClusterDetailsQueries/ClusterSupportTab/useDeleteNotificationContact', () => ({
  useDeleteNotificationContact: jest.fn(),
}));

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('@redhat-cloud-services/frontend-components-notifications'),
  };
  return config;
});

jest.mock('~/components/common/ErrorBox', () => () => <div data-testid="error-box" />);

const useFetchNotificationContactsMock = useFetchNotificationContacts as jest.Mock;
const useDeleteNotificationContactMock = useDeleteNotificationContact as jest.Mock;
const mutate = jest.fn();

describe('<NotificationContactsCard />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const useAddNotificationsMock = jest.spyOn(notifications, 'useAddNotification');
  const mockedAddNotification = jest.fn();
  useAddNotificationsMock.mockReturnValue(mockedAddNotification);

  const defaultProps = {
    subscriptionID: '1iGW3xYbKZAEdZLi207rcA1l0ob',
    isDisabled: false,
    isAddNotificationContactSuccess: true,
    isAddNotificationContactPending: false,
    addNotificationStatus: 'success',
  };
  const emptyState = {
    notificationContacts: {},
  };

  const defaultState = {
    notificationContacts: {
      subscriptionID: defaultProps.subscriptionID,
      contacts: [
        {
          username: 'username1',
          email: 'email1',
          firstName: 'firstName1',
          lastName: 'lastName1',
          userID: 'userID1',
        },
        {
          username: 'username2',
          email: 'email2',
          firstName: 'firstName2',
          lastName: 'lastName2',
          userID: 'userID2',
        },
      ],
    },
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('it is accessible', () => {
    it.each([[true], [false]])('isDisabled %p', async (isDisabled: boolean) => {
      // Arrange
      useFetchNotificationContactsMock.mockReturnValue(defaultState);
      useDeleteNotificationContactMock.mockReturnValue({
        isError: false,
        mutate,
        isSuccess: true,
        isPending: false,
      });
      // Act
      const { container } = render(
        <NotificationContactsCard {...defaultProps} isDisabled={isDisabled} />,
      );

      // Assert
      await act(async () => {
        await checkAccessibility(container);
      });
    });
  });

  it('empty content', () => {
    // Arrange
    useFetchNotificationContactsMock.mockReturnValue({ ...emptyState, refetch: jest.fn() });
    useDeleteNotificationContactMock.mockReturnValue({
      isError: false,
      mutate,
      isSuccess: true,
      isPending: false,
    });
    // Act
    render(
      <div data-testid="parent-div">
        <NotificationContactsCard {...defaultProps} />
      </div>,
    );

    // Assert
    expect(screen.getByTestId('parent-div').children.length).toBe(0);
  });

  it.each([
    [defaultProps.subscriptionID, 1],
    ['whatever the value', 1],
  ])(
    'subscriptionID: %p useFetchNotificationContactsMock is called %p',
    (subscriptionID, expectedNumberOfCalls) => {
      // Arrange
      useFetchNotificationContactsMock.mockReturnValue({
        ...defaultState,
        notificationContacts: { subscriptionID, pending: true },
        refetch: jest.fn(),
      });
      useDeleteNotificationContactMock.mockReturnValue({
        isError: false,
        mutate,
        isSuccess: true,
        isPending: false,
      });

      // Act
      render(<NotificationContactsCard {...defaultProps} />);

      // Assert
      expect(useFetchNotificationContactsMock).toHaveBeenCalledTimes(expectedNumberOfCalls);
    },
  );

  it('renders what it is expected', async () => {
    // Arrange
    const title = 'Notification contact deleted successfully';
    useFetchNotificationContactsMock.mockReturnValue({ ...defaultState });
    useDeleteNotificationContactMock.mockReturnValue({
      isError: false,
      mutate,
      isSuccess: true,
      isPending: false,
    });
    // Act
    const { user } = render(<NotificationContactsCard {...defaultProps} />);

    const kebabBtn = screen.getAllByRole('button', { name: /kebab toggle/i });
    // Assert
    expect(kebabBtn).toHaveLength(2);
    expect(
      screen.getByRole('row', {
        name: /username1 email1 firstname1 lastname1/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /username2 email2 firstname2 lastname2/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('error-box')).not.toBeInTheDocument();

    await user.click(kebabBtn[0]);

    const deleteBtn = screen.getByRole('menuitem', { name: /delete/i });

    await user.click(deleteBtn);
    expect(mockedDispatch).toHaveBeenCalledWith(clearDeleteNotificationContacts());
    expect(mockedAddNotification).toHaveBeenCalledWith({
      variant: 'success',
      title,
      dismissable: false,
    });
  });

  it('renders what it is expected with error', async () => {
    // Arrange
    const title = 'Notification contact deleted successfully';
    useDeleteNotificationContactMock.mockReturnValue({
      isError: true,
      mutate,
      isSuccess: false,
      isPending: false,
      error: {
        pending: false,
        fulfilled: true,
        error: true,
        errorCode: 404,
        internalErrorCode: '404',
        errorMessage: 'what ever error message',
        errorDetails: {
          kind: 'error',
          items: [],
        },
        operationID: 'whatever operation id',
      },
    });

    const errorProps = {
      ...defaultProps,
      isAddNotificationContactSuccess: false,
    };
    // Act
    render(<NotificationContactsCard {...errorProps} />);

    // Assert
    expect(mockedAddNotification).not.toHaveBeenCalledWith({
      variant: 'success',
      title,
      dismissable: false,
    });
    expect(screen.getByTestId('error-box')).toBeInTheDocument();
  });
});
