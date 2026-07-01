import React from 'react';
import * as reactRedux from 'react-redux';

import docLinks from '~/common/docLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import * as useResumeCluster from '~/queries/ClusterActionsQueries/useResumeCluster';
import { checkAccessibility, screen, withState } from '~/testUtils';

import ResumeClusterModal from './ResumeClusterModal';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedUseResumeCluster = jest.spyOn(useResumeCluster, 'useResumeCluster');

describe('<ResumeClusterModal />', () => {
  const onClose = jest.fn();
  const mutate = jest.fn();
  const resetResponse = jest.fn();

  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  const defaultReduxState = {
    modal: {
      data: {
        clusterID: 'myClusterId',
        clusterName: 'myClusterName',
      },
    },
  };

  const useResumeClusterReturnData = {
    mutate,
    isSuccess: false,
    error: null,
    isError: false,
    isPending: false,
    reset: resetResponse,
  };

  const defaultProps = {
    onClose,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible with modal open', async () => {
    mockedUseResumeCluster.mockReturnValue(useResumeClusterReturnData);
    const { container } = withState(defaultReduxState).render(
      <ResumeClusterModal {...defaultProps} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('displays an error when resume cluster response is an error', () => {
    mockedUseResumeCluster.mockReturnValue({
      ...useResumeClusterReturnData,
      isError: true,
      error: { errorMessage: 'I am an error', operationID: 'error_id' },
    });
    withState(defaultReduxState).render(<ResumeClusterModal {...defaultProps} />);
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByText('I am an error')).toBeInTheDocument();
  });

  it('renders correctly when pending', () => {
    mockedUseResumeCluster.mockReturnValue({
      ...useResumeClusterReturnData,
      isPending: true,
    });
    withState(defaultReduxState).render(<ResumeClusterModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  describe('mounted ', () => {
    it('when cancelled, calls closeModal but not onClose ', async () => {
      mockedUseResumeCluster.mockReturnValue(useResumeClusterReturnData);
      const { user } = withState(defaultReduxState).render(
        <ResumeClusterModal {...defaultProps} />,
      );

      expect(onClose).not.toHaveBeenCalled();
      expect(mockedDispatch).not.toHaveBeenCalled();
      await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
      expect(onClose).not.toHaveBeenCalled(); // prop
    });

    it('submits when user clicks on Resume cluster button', async () => {
      mockedUseResumeCluster.mockReturnValue(useResumeClusterReturnData);
      const { user } = withState(defaultReduxState).render(
        <ResumeClusterModal {...defaultProps} />,
      );

      expect(mutate).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Resume cluster' }));
      expect(mutate).toHaveBeenCalledWith({ clusterID: 'myClusterId', region: undefined });
    });

    it('submits when user clicks on Resume cluster button when region is known', async () => {
      mockedUseResumeCluster.mockReturnValue(useResumeClusterReturnData);
      const newReduxState = {
        modal: {
          data: {
            ...defaultReduxState.modal.data,
            rh_region_id: 'myRegion',
          },
        },
      };
      const { user } = withState(newReduxState).render(<ResumeClusterModal {...defaultProps} />);
      expect(mutate).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Resume cluster' }));
      expect(mutate).toHaveBeenCalledWith({ clusterID: 'myClusterId', region: 'myRegion' });
    });

    it('when fulfilled, closes dialog', () => {
      expect(onClose).not.toHaveBeenCalled();
      expect(resetResponse).not.toHaveBeenCalled();
      expect(mockedDispatch).not.toHaveBeenCalled();
      mockedUseResumeCluster.mockReturnValue({ ...useResumeClusterReturnData, isSuccess: true });
      withState(defaultReduxState).render(<ResumeClusterModal {...defaultProps} />);
      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
      expect(resetResponse).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('renders OCP hibernation doc link when cluster is not ROSA', () => {
      mockedUseResumeCluster.mockReturnValue(useResumeClusterReturnData);
      withState(defaultReduxState).render(<ResumeClusterModal {...defaultProps} />);

      expect(screen.getByText(/Learn more about cluster hibernation/)).toHaveAttribute(
        'href',
        docLinks.OCP_HIBERNATING_CLUSTER,
      );
    });

    it('renders ROSA hibernation support link when cluster is ROSA', () => {
      mockedUseResumeCluster.mockReturnValue(useResumeClusterReturnData);
      withState({
        modal: {
          data: {
            ...defaultReduxState.modal.data,
            isROSA: true,
          },
        },
      }).render(<ResumeClusterModal {...defaultProps} />);

      expect(screen.getByText(/Learn more about cluster hibernation/)).toHaveAttribute(
        'href',
        supportLinks.HIBERNATING_CLUSTER,
      );
    });
  });
});
