import React from 'react';
import * as reactRedux from 'react-redux';

import { useGlobalState } from '~/redux/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';

import AddOnsDeleteModal from '../AddOnsDeleteModal';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('~/components/common/Modal/ModalActions', () => ({
  closeModal: jest.fn(),
}));

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

describe('<AddOnsDeleteModal />', () => {
  const deleteClusterAddOn = jest.fn();
  const closeModal = jest.fn();

  const props = {
    deleteClusterAddOn,
    isDeleteClusterAddOnError: false,
    deleteClusterAddOnError: {},
    isDeleteClusterAddOnPending: false,
  };

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);
  const mockModalData = {
    addOnName: 'mockedAddOnName',
    addOnID: 'mockedAddOnID',
    clusterID: 'mockedClusterID',
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    useGlobalState.mockReturnValue(mockModalData);
    const { container } = render(<AddOnsDeleteModal {...props} />);
    await checkAccessibility(container);
  });

  it('delete button should be enabled only after inputting the add on name', async () => {
    useGlobalState.mockReturnValue(mockModalData);
    const { user } = render(<AddOnsDeleteModal {...props} />);

    expect(screen.getByRole('button', { name: 'Uninstall' })).not.toBeEnabled();

    const input = screen.getByPlaceholderText(/Enter name/i);
    await user.clear(input);
    await user.type(input, 'fake-addon-name');

    expect(screen.getByRole('button', { name: 'Uninstall' })).not.toBeEnabled();

    await user.clear(input);
    await user.type(input, 'mockedAddOnName');

    expect(screen.getByRole('button', { name: 'Uninstall' })).not.toHaveAttribute('aria-disabled');
  });

  it('should close modal on cancel', async () => {
    const { user } = render(<AddOnsDeleteModal {...props} />);
    expect(mockedDispatch).not.toHaveBeenCalledWith(closeModal());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockedDispatch).toHaveBeenCalledWith(closeModal());
  });

  it('should call deleteClusterAddOn correctly', async () => {
    const { user } = render(<AddOnsDeleteModal {...props} />);

    await user.clear(screen.getByPlaceholderText('Enter name'));
    await user.type(screen.getByPlaceholderText('Enter name'), 'mockedAddOnName');
    await user.click(screen.getByRole('button', { name: 'Uninstall' }));

    expect(deleteClusterAddOn).toHaveBeenCalledWith(
      { clusterID: 'mockedClusterID', addOnID: 'mockedAddOnID' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });
});
