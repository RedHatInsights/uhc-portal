import React from 'react';
import * as reactRedux from 'react-redux';

import { closeModal } from '~/components/common/Modal/ModalActions';
import { useGlobalState } from '~/redux/hooks';
import { render, screen } from '~/testUtils';

import DeleteMachinePoolModal from './DeleteMachinePoolModal';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('~/components/common/Modal/ModalActions');

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

describe('<DeleteMachinePoolModal />', () => {
  it('should show correct title and content', async () => {
    const mockModalData = {
      machinePool: { id: 'machinePool1' },
      performDeleteAction: jest.fn(),
    };
    (useGlobalState as jest.Mock).mockReturnValue(mockModalData);

    render(<DeleteMachinePoolModal />);

    expect(screen.queryByText(/Permanently delete machine pool\?/i)).toBeInTheDocument();
    expect(screen.queryByText(/"machinePool1" will be lost\./i)).toBeInTheDocument();
  });

  it('closes modal on cancel', async () => {
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
    const mockedDispatch = jest.fn();
    useDispatchMock.mockReturnValue(mockedDispatch);

    const { user } = render(<DeleteMachinePoolModal />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeModal).toHaveBeenCalled();
  });

  it('calls delete function on confirm', async () => {
    const mockModalData = {
      machinePool: { id: 'machinePool1' },
      performDeleteAction: jest.fn(),
    };
    (useGlobalState as jest.Mock).mockReturnValue(mockModalData);

    const { user } = render(<DeleteMachinePoolModal />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(closeModal).toHaveBeenCalled();
    expect(mockModalData.performDeleteAction).toHaveBeenCalled();
  });
});
