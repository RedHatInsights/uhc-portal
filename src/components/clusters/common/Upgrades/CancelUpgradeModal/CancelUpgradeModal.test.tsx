import React from 'react';
import * as reactRedux from 'react-redux';

import { useDeleteSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule';
import { checkAccessibility, render, screen } from '~/testUtils';

import { useGlobalState } from '../../../../../redux/hooks/useGlobalState';

import CancelUpgradeModal from './CancelUpgradeModal';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Mock the useDeleteSchedule hook
jest.mock('~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule');

jest.mock('../../../../../redux/hooks/useGlobalState', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('../clusterUpgradeActions', () => ({
  clearDeleteScheduleResponse: jest.fn(),
  closeModal: jest.fn(),
  deleteSchedule: jest.fn(),
}));

// Type the mocked modules
const mockUseDeleteSchedule = useDeleteSchedule as jest.Mock;
const mockUseGlobalState = useGlobalState as jest.Mock;

describe('<CancelUpgradeModal />', () => {
  let mockedDispatch: jest.Mock;
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

  const scheduleMock = {
    cluster_id: 'myClusterId',
    schedule: {
      id: 'myScheduleId',
      version: 'v1.2.3',
      next_run: new Date('2020-11-02').toISOString(),
    },
  };
  const shouldShowModal = true;

  const defaultProps = {
    isHypershift: false,
    clusterID: 'mockedID',
  };

  const mockMutate = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    mockedDispatch = jest.fn();
    useDispatchMock.mockReturnValue(mockedDispatch);

    mockUseDeleteSchedule.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      mutate: mockMutate,
      reset: mockReset,
      isSuccess: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    mockUseGlobalState.mockReturnValueOnce(shouldShowModal).mockReturnValueOnce(scheduleMock);

    const { container } = render(<CancelUpgradeModal {...defaultProps} />);
    await checkAccessibility(container);
  });

  it('calls deleteSchedule when button is clicked', async () => {
    mockUseGlobalState.mockReturnValue(scheduleMock);
    const { user } = await render(<CancelUpgradeModal {...defaultProps} />);
    expect(mockMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel this update' }));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('clears request state when fulfilled and closes modal', () => {
    mockUseGlobalState
      .mockReturnValueOnce(true) // isOpen: shouldShowModal returns true
      .mockReturnValueOnce(scheduleMock); // schedule
    mockUseDeleteSchedule.mockReturnValueOnce({
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      mutate: mockMutate,
      reset: mockReset,
      isSuccess: true,
    });

    render(<CancelUpgradeModal isHypershift={false} />);

    // Assert that the dispatch functions are called when fulfilled
    expect(mockReset).toHaveBeenCalled();
    expect(mockedDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
  });
});
