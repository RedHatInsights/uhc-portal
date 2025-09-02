import React from 'react';
import * as reactRedux from 'react-redux';

import * as useEditClusterName from '~/queries/ClusterActionsQueries/useEditClusterName';
import { checkAccessibility, render, screen } from '~/testUtils';

import EditDisplayNameDialog from './EditDisplayNameDialog';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedUseEditClusterName = jest.spyOn(useEditClusterName, 'useEditClusterName');

describe('<EditDisplayNameDialog />', () => {
  const closeModal = jest.fn();
  const onClose = jest.fn();
  const resetResponse = jest.fn();
  const mutate = jest.fn();

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const defaultProps = {
    onClose,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible when first opened', async () => {
    const { container } = render(<EditDisplayNameDialog {...defaultProps} />);
    await checkAccessibility(container);
  });

  it('is accessible when an error occurs', async () => {
    mockedUseEditClusterName.mockReturnValue({
      isError: true,
      error: 'I am an error',
    });
    const { rerender, container } = render(<EditDisplayNameDialog {...defaultProps} />);
    rerender(<EditDisplayNameDialog {...defaultProps} />);

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('is accessible when pending', async () => {
    mockedUseEditClusterName.mockReturnValue({
      isError: false,
      isPending: true,
    });
    const { container } = render(<EditDisplayNameDialog {...defaultProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('when cancelled, calls closeModal but not onClose ', async () => {
    mockedUseEditClusterName.mockReturnValue({
      reset: resetResponse,
      isPending: false,
      isError: false,
    });

    const { user } = render(<EditDisplayNameDialog {...defaultProps} />);
    expect(closeModal).not.toHaveBeenCalled();
    expect(resetResponse).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(resetResponse).toHaveBeenCalled(); // part of useEditClusterName hook
    expect(onClose).not.toHaveBeenCalled(); // prop
  });

  it('calls submit when Edit button is clicked', async () => {
    mockedUseEditClusterName.mockReturnValue({
      isError: false,
      isPending: false,
      mutate,
    });

    const { user } = render(<EditDisplayNameDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Edit' })).not.toBeEnabled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'my-new-name');

    expect(screen.getByRole('button', { name: 'Edit' })).not.toHaveAttribute('aria-disabled');
    expect(mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mutate).toHaveBeenCalledWith({ displayName: 'my-new-name', subscriptionID: '' });
  });

  it('does not allow blank whitespace to be entered when field is empty', async () => {
    const { user } = render(<EditDisplayNameDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Edit' })).not.toBeEnabled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '    ');

    expect(screen.getByRole('button', { name: 'Edit' })).not.toHaveAttribute('aria-disabled');
    expect(mutate).not.toHaveBeenCalled();

    await user.type(screen.getByRole('textbox'), '   my-new-name');
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mutate).toHaveBeenCalledWith({ displayName: 'my-new-name', subscriptionID: '' });
  });

  it('once fulfilled calls closeModal, resetResponse, and onClose', () => {
    expect(closeModal).not.toHaveBeenCalled();
    expect(resetResponse).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();

    mockedUseEditClusterName.mockReturnValue({
      reset: resetResponse,
      isError: false,
      isPending: false,
      isSuccess: true,
      mutate,
    });

    render(<EditDisplayNameDialog {...defaultProps} />);

    expect(mockedDispatch).toHaveBeenCalled();
    expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    expect(resetResponse).toHaveBeenCalled(); // part of useEditClusterName hook
    expect(onClose).toHaveBeenCalled(); // prop
  });
});
