import React from 'react';
import * as reactRedux from 'react-redux';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { defaultSubscription } from '~/components/clusters/common/__tests__/defaultClusterFromSubscription.fixtures';
import * as useEditSubscription from '~/queries/common/useEditSubscription';
import { checkAccessibility, screen, withState } from '~/testUtils';

import EditSubscriptionSettingsDialog from './EditSubscriptionSettingsDialog';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
const mockedDispatch = jest.fn();
useDispatchMock.mockReturnValue(mockedDispatch);

const mockedUseEditSubscription = jest.spyOn(useEditSubscription, 'useEditSubscription');

describe('<EditSubscriptionSettingsDialog />', () => {
  const onCloseMock = jest.fn();
  const mutateMock = jest.fn();
  const resetMock = jest.fn();

  const defaultProps = { onClose: onCloseMock };

  const defaultState = {
    modal: { data: { subscription: defaultSubscription } },
  };

  const defaultUseEditSubscriptionReturn = {
    isSuccess: false,
    error: null,
    rawError: null,
    isError: false,
    isPending: false,
    mutate: mutateMock,
    reset: resetMock,
  };

  afterEach(jest.clearAllMocks);

  it('is accessible', async () => {
    // Arrange
    mockedUseEditSubscription.mockReturnValue(defaultUseEditSubscriptionReturn);

    // Act
    const { container } = withState(defaultState).render(
      <EditSubscriptionSettingsDialog {...defaultProps} />,
    );

    // Assert
    await checkAccessibility(container);
  });

  it('does not display the cluster name', () => {
    // Arrange
    const newState = {
      modal: {
        data: {
          subscription: { ...defaultSubscription },
          name: 'myClusterName',
          shouldDisplayClusterName: false,
        },
      },
    };

    // Act
    withState(newState).render(<EditSubscriptionSettingsDialog {...defaultProps} />);

    // Assert
    expect(
      screen.getByRole('heading', {
        name: /subscription settings/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/myClusterName/i)).not.toBeInTheDocument();
  });

  it('does display the cluster name', () => {
    // Arrange
    const newState = {
      modal: {
        data: {
          subscription: { ...defaultSubscription },
          name: 'myClusterName',
          shouldDisplayClusterName: true,
        },
      },
    };

    // Act
    withState(newState).render(<EditSubscriptionSettingsDialog {...defaultProps} />);

    // Assert
    expect(
      screen.getByRole('heading', {
        name: /subscription settings/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/myClusterName/i)).toBeInTheDocument();
  });

  describe('user interacting with the modal', () => {
    // const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    // const dispatchMock = jest.fn();

    // beforeEach(() => {
    //   jest.resetAllMocks();
    //   useDispatchMock.mockReturnValue(dispatchMock);
    //   closeModalMock.mockReturnValue('closeModalValue');
    //   clearEditSubscriptionSettingsResponseMock.mockReturnValue(
    //     'clearEditSubscriptionSettingsResponseValue',
    //   );
    //   editSubscriptionSettingsMock.mockReturnValue('editSubscriptionSettingsValue');
    // });

    it.each([['cancel'], ['close']])('clicks on %s button', async (buttonName: string) => {
      // Arrange
      expect(onCloseMock).not.toHaveBeenCalled();
      expect(resetMock).not.toHaveBeenCalled();
      expect(mockedDispatch).not.toHaveBeenCalled();
      mockedUseEditSubscription.mockReturnValue(defaultUseEditSubscriptionReturn);

      // Act
      const { user } = withState(defaultState).render(
        <EditSubscriptionSettingsDialog {...defaultProps} />,
      );

      // Act
      await user.click(
        screen.getByRole('button', {
          name: new RegExp(buttonName, 'i'),
        }),
      );

      // Assert
      expect(onCloseMock).not.toHaveBeenCalled();
      expect(resetMock).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    });

    it('clicks on Save button after changing support level', async () => {
      const newState = {
        modal: {
          data: {
            subscription: {
              ...defaultSubscription,
              id: 'mySubscriptionId',
              capabilities: [{ name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true' }],
            },
            name: 'myClusterName',
            shouldDisplayClusterName: true,
          },
        },
      };
      // Arrange
      mockedUseEditSubscription.mockReturnValue(defaultUseEditSubscriptionReturn);
      expect(mutateMock).not.toHaveBeenCalled();

      const { user } = withState(newState).render(
        <EditSubscriptionSettingsDialog {...defaultProps} />,
      );

      // Act
      await user.click(screen.getByLabelText('Standard'));
      await user.click(
        screen.getByRole('button', {
          name: /save/i,
        }),
      );

      // Assert
      expect(mutateMock).toHaveBeenCalledWith({
        subscriptionID: 'mySubscriptionId',
        data: {
          support_level: 'Standard',
          usage: 'Production',
          service_level: 'L1-L3',
          system_units: 'Cores/vCPU',
          cluster_billing_model: 'standard',
          isValid: true,
        },
      });
    });

    it('clicks on Save button after changing Sockets level', async () => {
      const newState = {
        modal: {
          data: {
            subscription: {
              ...defaultSubscription,
              support_level: 'Self-Support',
              capabilities: [{ name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true' }],
              socket_total: 20,
              cpu_total: 10,
              system_units: 'Sockets',
              id: 'mySubscriptionId',
              status: 'Disconnected',
            },
            name: 'myClusterName',
            shouldDisplayClusterName: true,
          },
        },
      };
      // Arrange
      mockedUseEditSubscription.mockReturnValue(defaultUseEditSubscriptionReturn);
      expect(mutateMock).not.toHaveBeenCalled();

      const { user } = withState(newState).render(
        <EditSubscriptionSettingsDialog {...defaultProps} />,
      );

      // Act
      const socketInput = screen.getByLabelText(
        'Number of sockets (excluding control plane nodes)',
      );
      await user.clear(socketInput);
      await user.type(socketInput, '15');

      await user.click(
        screen.getByRole('button', {
          name: /save/i,
        }),
      );

      // Assert
      expect(mutateMock).toHaveBeenCalledWith({
        subscriptionID: 'mySubscriptionId',
        data: {
          support_level: 'Self-Support',
          usage: 'Production',
          service_level: 'L1-L3',
          system_units: 'Sockets',
          cluster_billing_model: 'standard',
          isValid: true,
          cpu_total: 15,
          socket_total: 15,
        },
      });
    });

    it('clicks on Save button after changing Cores/vCPU level', async () => {
      const newState = {
        modal: {
          data: {
            subscription: {
              ...defaultSubscription,
              support_level: 'Self-Support',
              capabilities: [{ name: subscriptionCapabilities.SUBSCRIBED_OCP, value: 'true' }],
              socket_total: 20,
              cpu_total: 10,
              system_units: 'Cores/vCPU',
              id: 'mySubscriptionId',
              status: 'Disconnected',
            },
            name: 'myClusterName',
            shouldDisplayClusterName: true,
          },
        },
      };
      // Arrange
      mockedUseEditSubscription.mockReturnValue(defaultUseEditSubscriptionReturn);
      expect(mutateMock).not.toHaveBeenCalled();

      const { user } = withState(newState).render(
        <EditSubscriptionSettingsDialog {...defaultProps} />,
      );

      // Act
      const vCPUInput = screen.getByLabelText(
        'Number of compute cores (excluding control plane nodes)',
      );
      await user.clear(vCPUInput);
      await user.type(vCPUInput, '15');

      await user.click(
        screen.getByRole('button', {
          name: /save/i,
        }),
      );

      // Assert
      expect(mutateMock).toHaveBeenCalledWith({
        subscriptionID: 'mySubscriptionId',
        data: {
          support_level: 'Self-Support',
          usage: 'Production',
          service_level: 'L1-L3',
          system_units: 'Cores/vCPU',
          cluster_billing_model: 'standard',
          isValid: true,
          cpu_total: 15,
          socket_total: 1,
        },
      });
    });

    it('closes modal and clears data when api call is success', () => {
      const newUseEditSubscriptionReturn = {
        ...defaultUseEditSubscriptionReturn,
        isSuccess: true,
      };
      mockedUseEditSubscription.mockReturnValue(newUseEditSubscriptionReturn);

      expect(resetMock).not.toHaveBeenCalled();
      expect(onCloseMock).not.toHaveBeenCalled();
      expect(mockedDispatch).not.toHaveBeenCalled();

      // Act
      withState(defaultState).render(<EditSubscriptionSettingsDialog {...defaultProps} />);

      expect(resetMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    });
  });
});
