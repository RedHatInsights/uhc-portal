import React from 'react';
import * as reactRedux from 'react-redux';

import { refetchMachineOrNodePoolsQuery } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { checkAccessibility, screen, waitFor, within, withState } from '~/testUtils';

import { NodePoolWithUpgradePolicies } from '../machinePoolCustomTypes';

import { UpdateMachinePoolModal, UpdatePoolButton } from './UpdateMachinePoolModal';
import * as updateMachinePoolsHelpers from './updateMachinePoolsHelpers';

const clusterId = 'cluster-1';
const clusterVersionID = 'openshift-v4.13.3';
const clusterVersionRawID = '4.13.3';

const defaultMachinePool = {
  id: 'my-machine-pool',
  version: { id: 'openshift-v4.12.5', raw_id: '4.12.5' },
};

const defaultCluster = {
  id: clusterId,
  version: { available_upgrades: [], id: clusterVersionID },
  hypershift: { enabled: true },
};

const defaultState = {
  clusters: {
    details: {
      cluster: defaultCluster,
    },
  },
  machinePools: {
    getMachinePools: { error: false, fulfilled: true, data: [defaultMachinePool] },
  },
  clusterUpgrades: { schedules: { items: [] } },
  modal: { modalName: 'update-machine-pool-version', data: { machinePool: defaultMachinePool } },
};

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

jest.mock('~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools', () => ({
  refetchMachineOrNodePoolsQuery: jest.fn(),
}));

// ********************* Tests ***********************

describe('UpdateMachinePoolModal', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  afterEach(() => {
    useDispatchMock.mockClear();
    mockedDispatch.mockClear();
  });
  describe('<UpdatePoolButton />', () => {
    it('displays the update button when the machine pool version is behind the control plane', async () => {
      const { container, user } = withState(defaultState).render(
        <UpdatePoolButton
          machinePool={defaultMachinePool}
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
        />,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();

      await checkAccessibility(container);

      await user.click(screen.getByRole('button'));

      expect(useDispatchMock).toHaveBeenCalledTimes(1);
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('OPEN_MODAL');
    });

    it('displays the update button when the machine pool version is behind the control plane and control plane has available upgrades', () => {
      const newCluster = {
        ...defaultCluster,
        version: { ...defaultCluster.version, available_upgrades: ['I am an upgrade object'] },
      };

      const newState = {
        ...defaultState,
        clusters: {
          details: {
            cluster: newCluster,
          },
        },
      };
      withState(newState).render(
        <UpdatePoolButton
          machinePool={defaultMachinePool}
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
        />,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    describe('displays null when', () => {
      it('is not hypershift', () => {
        const newCluster = { ...defaultCluster, hypershift: { enabled: false } };

        const newState = {
          ...defaultState,
          clusters: {
            details: {
              cluster: newCluster,
            },
          },
        };
        const { container } = withState(newState).render(
          <UpdatePoolButton
            machinePool={defaultMachinePool}
            isMachinePoolError={false}
            isHypershift={false}
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      it('the control plane version is not known', () => {
        const newCluster = { ...defaultCluster, version: {} };

        const newState = {
          ...defaultState,
          clusters: {
            details: {
              cluster: newCluster,
            },
          },
        };
        const { container } = withState(newState).render(
          <UpdatePoolButton
            machinePool={defaultMachinePool}
            isMachinePoolError={false}
            isHypershift
            controlPlaneVersion=""
            controlPlaneRawVersion=""
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      it('there is an error getting machine pools', () => {
        const newState = {
          ...defaultState,
          machinePools: {
            getMachinePools: { error: true, fulfilled: true, data: [defaultMachinePool] },
          },
        };
        const { container } = withState(newState).render(
          <UpdatePoolButton
            machinePool={defaultMachinePool}
            isMachinePoolError
            isHypershift
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      it('getting the machine pools has not yet been fulfilled', () => {
        const newState = {
          ...defaultState,
          machinePools: {
            getMachinePools: { error: false, fulfilled: false, data: [defaultMachinePool] },
          },
        };
        const { container } = withState(newState).render(
          <UpdatePoolButton
            machinePool={{}}
            isMachinePoolError={false}
            isHypershift
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      it('there are not any machine pool', () => {
        const newState = {
          ...defaultState,
          machinePools: {
            getMachinePools: { error: true, fulfilled: true, data: [] },
          },
        };
        const { container } = withState(newState).render(
          <UpdatePoolButton
            machinePool={{}}
            isMachinePoolError={false}
            isHypershift
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      it('the control plane is in process of being updated', () => {
        const newState = {
          ...defaultState,
          clusterUpgrades: {
            schedules: {
              items: [
                { upgrade_type: 'OSD', schedule_type: 'automatic', state: { value: 'started' } },
              ],
            },
          },
        };
        const { container } = withState(newState).render(
          <UpdatePoolButton
            machinePool={defaultMachinePool}
            isMachinePoolError={false}
            isHypershift
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      it('the machine pool version is not known', () => {
        const newMachinePool = { ...defaultMachinePool, version: {} };
        const { container } = withState(defaultState).render(
          <UpdatePoolButton
            machinePool={newMachinePool}
            isMachinePoolError={false}
            isHypershift
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      it('the machine pool version is at the same version as the control plane', () => {
        const newMachinePool = { ...defaultMachinePool, version: { id: 'openshift-v4.13.3' } };

        expect(defaultCluster.version.id).toEqual('openshift-v4.13.3');
        const { container } = withState(defaultState).render(
          <UpdatePoolButton
            machinePool={newMachinePool}
            isMachinePoolError={false}
            isHypershift
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
          />,
        );

        expect(container).toBeEmptyDOMElement();
      });

      describe('shows helper popover when', () => {
        it('the control plane version is not a valid version for machine pool', async () => {
          const newMachinePool = {
            ...defaultMachinePool,
            version: { id: 'openshift-v4.13.1', available_upgrades: ['4.13.2'] },
          };

          expect(defaultCluster.version.id).toEqual('openshift-v4.13.3');

          const { user } = withState(defaultState).render(
            <UpdatePoolButton
              machinePool={newMachinePool}
              isMachinePoolError={false}
              isHypershift
              controlPlaneVersion={clusterVersionID}
              controlPlaneRawVersion={clusterVersionRawID}
            />,
          );

          expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();

          await user.click(screen.getByRole('button'));
          expect(await screen.findByRole('dialog')).toBeInTheDocument();

          expect(
            screen.getByText(
              `This machine pool cannot be updated because there isn't a migration path to version openshift-v4.13.3`,
            ),
          );
        });

        it('the machine pool is scheduled to be updated', async () => {
          const newMachinePool = {
            ...defaultMachinePool,
            version: { id: 'openshift-v4.13.1', available_upgrades: ['4.13.3'] },
            upgradePolicies: { items: ['I am an upgrade policy'] },
          } as NodePoolWithUpgradePolicies;

          expect(defaultCluster.version.id).toEqual('openshift-v4.13.3');

          const { user } = withState(defaultState).render(
            <UpdatePoolButton
              machinePool={newMachinePool}
              isMachinePoolError={false}
              isHypershift
              controlPlaneVersion={clusterVersionID}
              controlPlaneRawVersion={clusterVersionRawID}
            />,
          );

          expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();

          await user.click(screen.getByRole('button'));
          expect(await screen.findByRole('dialog')).toBeInTheDocument();

          expect(screen.getByText(`This machine pool is scheduled to be updated`));
        });

        it('there was error getting machine pool upgrade policies', async () => {
          const newMachinePool = {
            ...defaultMachinePool,
            version: { id: 'openshift-v4.13.1', available_upgrades: ['4.13.3'] },
            upgradePolicies: { errorMessage: 'I am an error' },
          } as NodePoolWithUpgradePolicies;

          expect(defaultCluster.version.id).toEqual('openshift-v4.13.3');

          const { user } = withState(defaultState).render(
            <UpdatePoolButton
              machinePool={newMachinePool}
              isMachinePoolError={false}
              isHypershift
              controlPlaneVersion={clusterVersionID}
              controlPlaneRawVersion={clusterVersionRawID}
            />,
          );

          expect(screen.getByRole('button', { name: 'Error' })).toBeInTheDocument();

          await user.click(screen.getByRole('button'));
          expect(await screen.findByRole('dialog')).toBeInTheDocument();

          expect(screen.getByText(`I am an error`));
        });
      });
    });
  });

  describe('<UpdateMachinePoolModal />', () => {
    const mockUpdatePools = jest.spyOn(updateMachinePoolsHelpers, 'updateAllMachinePools');
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('is hidden when redux state has modal closed', () => {
      const newState = { ...defaultState, modal: { data: {} } };
      const { container } = withState(newState).render(
        <UpdateMachinePoolModal
          isHypershift
          controlPlaneVersion={clusterVersionID}
          clusterId={clusterId}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });

    it('displays modal with machine name', async () => {
      const { container } = withState(defaultState).render(
        <UpdateMachinePoolModal
          isHypershift
          controlPlaneVersion={clusterVersionID}
          clusterId={clusterId}
        />,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByText('Update machine pool my-machine-pool', { exact: false }),
      ).toBeInTheDocument();
      await checkAccessibility(container);
    });

    it('calls updateAllMachine pools when clicking on submit ', async () => {
      const mockedDispatch = jest.fn();
      useDispatchMock.mockReturnValue(mockedDispatch);
      mockUpdatePools.mockResolvedValue([]);

      const { user } = withState(defaultState).render(
        <UpdateMachinePoolModal
          isHypershift
          controlPlaneVersion={clusterVersionID}
          clusterId={clusterId}
        />,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(mockUpdatePools).toHaveBeenCalledTimes(0);

      await user.click(screen.getByRole('button', { name: 'Update machine pool' }));

      await waitFor(() => expect(mockUpdatePools).toHaveBeenCalledTimes(1));

      // once to to close the modal, second to invalidate machine pools
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(refetchMachineOrNodePoolsQuery).toHaveBeenCalledTimes(1);
      expect(mockedDispatch.mock.calls[0][0].type).toEqual('CLOSE_MODAL');
    });

    it('displays error', async () => {
      mockUpdatePools.mockResolvedValue(['I am an error!']);
      const mockedDispatch = jest.fn();
      useDispatchMock.mockReturnValue(mockedDispatch);

      const { user } = withState(defaultState).render(
        <UpdateMachinePoolModal
          isHypershift
          controlPlaneVersion={clusterVersionID}
          clusterId={clusterId}
        />,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(mockUpdatePools).toHaveBeenCalledTimes(0);

      await user.click(screen.getByRole('button', { name: 'Update machine pool' }));

      await waitFor(() => expect(mockUpdatePools).toHaveBeenCalledTimes(1));
      // once to get updated machine pool list
      expect(refetchMachineOrNodePoolsQuery).toHaveBeenCalledTimes(1);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText(
          'Machine pool my-machine-pool could not be updated',
        ),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Danger alert details' }));
      expect(within(screen.getByRole('alert')).getByText('I am an error!')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Update machine pool' })).toBeDisabled();
    });
  });
});
