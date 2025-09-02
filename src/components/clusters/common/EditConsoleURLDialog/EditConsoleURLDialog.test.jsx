import React from 'react';
import * as reactRedux from 'react-redux';

import * as useEditConsoleURL from '~/queries/ClusterActionsQueries/useEditConsoleURL';
import { checkAccessibility, screen, withState } from '~/testUtils';

import EditConsoleURLDialog from './EditConsoleURLDialog';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedUseEditConsoleURL = jest.spyOn(useEditConsoleURL, 'useEditConsoleURL');

describe('<EditConsoleURLDialog />', () => {
  const closeModal = jest.fn();
  const onClose = jest.fn();
  const mutate = jest.fn();
  const resetResponse = jest.fn();

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const defaultProps = {
    onClose,
  };

  const defaultState = {
    modal: {
      data: {
        id: 'my-cluster-id',
        console_url: 'http://www.consoleURL.com',
        subscription: {
          id: 'my-subscription-id',
          display_name: 'my-cluster-name',
          // rh_region_id:'myRegion'
        },
        shouldDisplayClusterName: true,
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = withState(defaultState, true).render(
      <EditConsoleURLDialog {...defaultProps} />,
    );
    await checkAccessibility(container);
  });

  it('when cancelled, calls closeModal but not onClose ', async () => {
    mockedUseEditConsoleURL.mockReturnValue({
      reset: resetResponse,
      isPending: false,
      isError: false,
    });

    const { user } = withState(defaultState, true).render(
      <EditConsoleURLDialog {...defaultProps} />,
    );
    expect(closeModal).not.toHaveBeenCalled();
    expect(resetResponse).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(resetResponse).toHaveBeenCalled(); // part of useConsoleURLDialog hook
    expect(onClose).not.toHaveBeenCalled(); // prop
  });

  it('submits when user clicks on  Save button', async () => {
    mockedUseEditConsoleURL.mockReturnValue({
      reset: resetResponse,
      isPending: false,
      isError: false,
      mutate,
    });

    const { user } = withState(defaultState, true).render(
      <EditConsoleURLDialog {...defaultProps} />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeEnabled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'http://www.my-new-console-url.com');

    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-disabled');

    expect(mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutate).toHaveBeenCalledWith({
      clusterID: 'my-cluster-id',
      consoleUrl: 'http://www.my-new-console-url.com',
      region: undefined,
      subscriptionID: 'my-subscription-id',
    });
  });

  it('submits with region when user clicks on  Save button', async () => {
    mockedUseEditConsoleURL.mockReturnValue({
      reset: resetResponse,
      isPending: false,
      isError: false,
      mutate,
    });

    const newState = {
      ...defaultState,
    };

    newState.modal.data.subscription.rh_region_id = 'myRegion';

    const { user } = withState(newState, true).render(<EditConsoleURLDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeEnabled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'http://www.my-new-console-url.com');

    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-disabled');

    expect(mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutate).toHaveBeenCalledWith({
      clusterID: 'my-cluster-id',
      consoleUrl: 'http://www.my-new-console-url.com',
      region: 'myRegion',
      subscriptionID: 'my-subscription-id',
    });
  });

  it('shows error box when an error occurs', () => {
    mockedUseEditConsoleURL.mockReturnValue({
      reset: resetResponse,
      isPending: false,
      isError: true,
      mutate,
      error: 'I am an error',
    });

    withState(defaultState, true).render(<EditConsoleURLDialog {...defaultProps} />);
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
  });
});
