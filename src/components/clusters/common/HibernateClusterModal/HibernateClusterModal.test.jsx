import React from 'react';
import * as reactRedux from 'react-redux';

import docLinks from '~/common/docLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import * as useHibernateCluster from '~/queries/ClusterActionsQueries/useHibernateCluster';
import * as useGetSchedules from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { checkAccessibility, screen, withState } from '~/testUtils';

import HibernateClusterModal from './HibernateClusterModal';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const mockedUseHibernateCluster = jest.spyOn(useHibernateCluster, 'useHibernateCluster');
const mockedUseGetSchedules = jest.spyOn(useGetSchedules, 'useGetSchedules');

describe('<HibernateClusterModal />', () => {
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
        subscriptionID: 'mySubscriptionId',
      },
    },
  };

  const useGetSchedulesReturnData = { data: { items: [], isLoading: false } };
  const useHibernateClusterReturnData = {
    mutate,
    isSuccess: false,
    error: undefined,
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
    mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
    mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);
    const { container } = withState(defaultReduxState).render(
      <HibernateClusterModal {...defaultProps} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('displays an error when hibernate cluster response is an error', () => {
    mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
    mockedUseHibernateCluster.mockReturnValue({
      ...useHibernateClusterReturnData,
      isError: true,
      error: { errorMessage: 'I am an error', operationID: 'error_id' },
    });
    withState(defaultReduxState).render(<HibernateClusterModal {...defaultProps} />);
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByText('I am an error')).toBeInTheDocument();
  });

  it('renders correctly when pending', () => {
    mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
    mockedUseHibernateCluster.mockReturnValue({
      ...useHibernateClusterReturnData,
      isPending: true,
    });
    withState(defaultReduxState).render(<HibernateClusterModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  describe('mounted ', () => {
    it('when cancelled, calls closeModal but not onClose ', async () => {
      mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
      mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);
      const { user } = withState(defaultReduxState).render(
        <HibernateClusterModal {...defaultProps} />,
      );

      expect(onClose).not.toHaveBeenCalled();
      expect(resetResponse).not.toHaveBeenCalled();
      expect(mockedDispatch).not.toHaveBeenCalled();

      await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);

      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
      expect(resetResponse).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled(); // prop
    });

    it('submits when user clicks on Hibernate cluster button', async () => {
      mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
      mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);

      expect(mutate).not.toHaveBeenCalled();

      const { user } = withState(defaultReduxState).render(
        <HibernateClusterModal {...defaultProps} />,
      );
      await user.click(screen.getByRole('button', { name: 'Hibernate cluster' }));
      expect(mutate).toHaveBeenCalledWith({ clusterID: 'myClusterId', region: undefined });
    });

    it('submits when user clicks on Hibernate cluster button when region is known', async () => {
      mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
      mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);

      expect(mutate).not.toHaveBeenCalled();

      const newReduxState = {
        modal: {
          data: {
            ...defaultReduxState.modal.data,
            rh_region_id: 'myRegion',
          },
        },
      };

      const { user } = withState(newReduxState).render(<HibernateClusterModal {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: 'Hibernate cluster' }));
      expect(mutate).toHaveBeenCalledWith({ clusterID: 'myClusterId', region: 'myRegion' });
    });

    it('when fulfilled, closes dialog', () => {
      mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
      mockedUseHibernateCluster.mockReturnValue({
        ...useHibernateClusterReturnData,
        isSuccess: true,
      });

      expect(onClose).not.toHaveBeenCalled();
      expect(resetResponse).not.toHaveBeenCalled();
      expect(mockedDispatch).not.toHaveBeenCalled();

      withState(defaultReduxState).render(<HibernateClusterModal {...defaultProps} />);
      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
      expect(resetResponse).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('displays message when upgrades are in progress', () => {
      mockedUseGetSchedules.mockReturnValue({
        data: { items: [{ state: { value: 'started' } }], isLoading: false },
      });
      mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);
      withState(defaultReduxState).render(<HibernateClusterModal {...defaultProps} />);

      expect(
        screen.getByText('is not possible while the cluster is upgrading.', { exact: false }),
      ).toBeInTheDocument();

      expect(screen.queryByRole('button', { name: 'Hibernate cluster' })).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'See version update details' }),
      ).toBeInTheDocument();
    });

    it('displays message when upgrades are scheduled', () => {
      mockedUseGetSchedules.mockReturnValue({
        data: { items: [{ state: { value: 'scheduled' } }], isLoading: false },
      });
      mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);
      withState(defaultReduxState).render(<HibernateClusterModal {...defaultProps} />);

      expect(
        screen.getByText('Try again after the cluster upgrade is done or cancel the upgrade', {
          exact: false,
        }),
      ).toBeInTheDocument();

      expect(screen.queryByRole('button', { name: 'Hibernate cluster' })).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Change cluster upgrade policy' }),
      ).toBeInTheDocument();
    });

    it('renders OCP hibernation doc link when cluster is not ROSA', () => {
      mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
      mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);
      withState(defaultReduxState).render(<HibernateClusterModal {...defaultProps} />);

      expect(screen.getByText(/Learn more about cluster hibernation/)).toHaveAttribute(
        'href',
        docLinks.OCP_HIBERNATING_CLUSTER,
      );
    });

    it('renders ROSA hibernation support link when cluster is ROSA', () => {
      mockedUseGetSchedules.mockReturnValue(useGetSchedulesReturnData);
      mockedUseHibernateCluster.mockReturnValue(useHibernateClusterReturnData);
      withState({
        modal: {
          data: {
            ...defaultReduxState.modal.data,
            isROSA: true,
          },
        },
      }).render(<HibernateClusterModal {...defaultProps} />);

      expect(screen.getByText(/Learn more about cluster hibernation/)).toHaveAttribute(
        'href',
        supportLinks.HIBERNATING_CLUSTER,
      );
    });
  });
});
