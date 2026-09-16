import React from 'react';
import * as reactRedux from 'react-redux';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { defaultClusterFromSubscription } from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import { useGlobalState } from '~/redux/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';

import Support from '../Support';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('~/components/common/Modal/ModalActions', () => ({
  openModal: jest.fn(),
}));

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const useGlobalStateMock = useGlobalState as jest.Mock;

// TODO:  Do mock children - it doesn't test the actual component
jest.mock('../components/AddNotificationContactButton', () => () => (
  <div data-testid="add-notification-contact-button" />
));

jest.mock('../components/NotificationContactsCard', () => (props: any) => (
  <div data-testid="notification-contacts-card" />
));

jest.mock('../components/SupportCasesCard', () => (props: any) => (
  <div data-testid="support-cases-card" />
));

describe('<Support />', () => {
  const isAddNotificationContactSuccessMock = true;
  const isAddNotificationContactPendingMock = false;
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  describe('it is accessible', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('default cluster from subscription', async () => {
      // Act
      const { container } = render(
        <Support
          cluster={defaultClusterFromSubscription}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      // Assert
      await checkAccessibility(container);
    });

    it('plan type RHOIC', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({});
      const clusterProp = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultClusterFromSubscription.subscription,
          managed: false,
          plan: { type: normalizedProducts.RHOIC },
        },
      };

      // Act
      const { container } = render(
        <Support
          cluster={clusterProp}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      // Assert
      await checkAccessibility(container);
    });
  });

  describe('check content', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('default cluster from subscription', () => {
      // Act
      render(
        <Support
          cluster={defaultClusterFromSubscription}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      // Assert
      expect(screen.getByTestId('add-notification-contact-button')).toBeInTheDocument();
      expect(screen.queryByTestId('support-cases-card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('notification-contacts-card')).not.toBeInTheDocument();
    });

    it('RHOIC and with subscription ID', () => {
      // Arrange
      const cluster = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultClusterFromSubscription.subscription,
          id: 'whatevertheid',
          managed: true,
          plan: { type: normalizedProducts.RHOIC },
        },
      };

      // Act
      render(
        <Support
          cluster={cluster}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      // Assert
      expect(screen.getByTestId('add-notification-contact-button')).toBeInTheDocument();
      expect(screen.queryByTestId('support-cases-card')).not.toBeInTheDocument();
      expect(screen.getByTestId('notification-contacts-card')).toBeInTheDocument();
    });

    it('ROVS and with subscription ID', () => {
      const cluster = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultClusterFromSubscription.subscription,
          id: 'whatevertheid',
          managed: true,
          plan: { type: normalizedProducts.ROVS },
        },
      };

      render(
        <Support
          cluster={cluster}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      expect(screen.getByTestId('add-notification-contact-button')).toBeInTheDocument();
      expect(screen.queryByTestId('support-cases-card')).not.toBeInTheDocument();
      expect(screen.getByTestId('notification-contacts-card')).toBeInTheDocument();
    });

    it('with subscription ID', () => {
      // Arrange
      const cluster = {
        ...defaultClusterFromSubscription,
        subscription: {
          ...defaultClusterFromSubscription.subscription,
          id: 'whatevertheid',
          managed: true,
        },
      };
      // Act
      render(
        <Support
          cluster={cluster}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      // Assert
      expect(screen.getByTestId('add-notification-contact-button')).toBeInTheDocument();
      expect(screen.getByTestId('support-cases-card')).toBeInTheDocument();

      expect(screen.getByTestId('notification-contacts-card')).toBeInTheDocument();
    });

    it('without subscription ID', () => {
      // Act
      render(
        <Support
          cluster={defaultClusterFromSubscription}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      // Assert
      expect(screen.getByTestId('add-notification-contact-button')).toBeInTheDocument();
      expect(screen.queryByTestId('support-cases-card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('notification-contacts-card')).not.toBeInTheDocument();
    });

    it('is disabled', () => {
      // Act
      render(
        <Support
          isDisabled
          cluster={defaultClusterFromSubscription}
          addNotificationStatus="success"
          isAddNotificationContactSuccess={isAddNotificationContactSuccessMock}
          isAddNotificationContactPending={isAddNotificationContactPendingMock}
        />,
      );

      // Assert
      expect(screen.queryByTestId('add-notification-contact-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('support-cases-card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('notification-contacts-card')).not.toBeInTheDocument();
    });
  });
});
