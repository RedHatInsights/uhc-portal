import React from 'react';
import type axios from 'axios';
import * as reactRedux from 'react-redux';
import semver from 'semver';

import links from '~/common/installLinks.mjs';
import { refetchMachineOrNodePoolsQuery } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import apiRequest from '~/services/apiRequest';
import { checkAccessibility, screen, within, withState } from '~/testUtils';
import { NodePoolUpgradePolicy } from '~/types/clusters_mgmt.v1';

import { UpdateAllMachinePools } from './index';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

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

// @ts-ignore
const getApiPatchParams = (index: number) => apiRequestMock.patch.mock.calls[index][1]?.params;

// ********************* Variables ***********************

const clusterVersionID = 'openshift-v4.12.13';
const clusterVersionRawID = '4.12.13';
const clusterId = 'myClusterId';

const updateAllButtonTestId = 'btn-update-all';
const errorAlertTestId = 'alert-danger';
const warningAlertTestId = 'alert-warning';
const goToMachinePoolText = 'Go to Machine pools list';

// ********************* Helpers ***********************

const expectUpdateButtonPresence = () => {
  expect(screen.getByTestId(updateAllButtonTestId)).toBeInTheDocument();
};

const expectUpdateButtonAbsence = (container?: HTMLElement) => {
  expect(screen.queryByTestId(updateAllButtonTestId)).not.toBeInTheDocument();
  if (container) expect(container.firstChild).toBeNull();
};

// The type for the user isn't easily available
const clickUpdateButton = async (user: any) => {
  await user.click(screen.getByTestId(updateAllButtonTestId));
};

// ********************* Default store values ***********************
const machinePoolUpToDate1 = {
  version: { id: clusterVersionID, raw_id: clusterVersionRawID },
  id: 'uptodate1',
};
const machinePoolUpToDate2 = {
  version: { id: clusterVersionID, raw_id: clusterVersionRawID },
  id: 'uptodate2',
};

const machinePoolBehind1 = {
  version: { id: 'openshift-v4.12.5', raw_id: '4.12.5' },
  id: 'behind1',
};
const machinePoolBehind2 = {
  version: { id: 'openshift-v4.11.0', raw_id: '4.11.0' },
  id: 'behind2',
};

const machineAhead1 = { version: { id: 'openshift-v4.12.15-candidate' }, id: 'ahead1' };

const defaultMachinePools = {
  fulfilled: true,
  error: false,
  pending: false,
  data: [machinePoolUpToDate1, machinePoolUpToDate2],
};

const defaultCluster = {
  id: clusterId,
  version: { id: clusterVersionID, available_upgrades: [] },
  hypershift: { enabled: true },
};

const defaultStore = {
  machinePools: {
    getMachinePools: defaultMachinePools,
  },
  clusters: {
    details: {
      cluster: defaultCluster,
    },
  },
  clusterUpgrades: {
    schedules: { items: [] },
  },
};

// ********************* Tests ***********************

describe('<UpdateAllMachinePools />', () => {
  describe('hides the update link', () => {
    it('when all machine pools are at the same version as the control plane', () => {
      const newState = {
        ...defaultStore,
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={defaultMachinePools.data}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when it is not a HCP cluster', () => {
      const newState = {
        ...defaultStore,
        machinePools: {
          getMachinePools: {
            ...defaultMachinePools,
            data: [machinePoolBehind1, machinePoolBehind2],
          },
        },
        clusters: { details: { cluster: { ...defaultCluster, hypershift: { enabled: false } } } },
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift={false}
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when machine pools are still being pulled and is HCP', () => {
      const newState = {
        ...defaultStore,
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={[]}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when machine pools are still being pulled and is not HCP', () => {
      const machinePools = {
        fulfilled: false,
        error: false,
        data: [],
      };
      const newState = {
        ...defaultStore,
        machinePools: { getMachinePools: machinePools },
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when there was an error getting the machine pools', () => {
      const machinePools = {
        fulfilled: true,
        error: true,
        data: [machinePoolBehind1, machinePoolBehind2],
      };
      const newState = {
        ...defaultStore,
        machinePools: { getMachinePools: machinePools },
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when the control plane version is unknown', () => {
      // This is unlikely
      const newState = {
        ...defaultStore,
        machinePools: {
          getMachinePools: {
            ...defaultMachinePools,
            data: [machinePoolBehind1, machinePoolBehind2],
          },
        },
        clusters: { details: { cluster: { ...defaultCluster, version: { id: undefined } } } },
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion=""
          controlPlaneRawVersion=""
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when there are no machine pools', () => {
      // This is unlikely
      const newState = {
        ...defaultStore,
        machinePools: { getMachinePools: { ...defaultMachinePools, data: [] } },
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when all  machine pools are above the control plane', () => {
      // This is extremely unlikely
      const newState = {
        ...defaultStore,
        machinePools: {
          getMachinePools: {
            ...defaultMachinePools,
            data: [machineAhead1],
          },
        },
      };

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when control plane version is not a valid version for machine pools', () => {
      const newState = {
        ...defaultStore,
        machinePools: {
          getMachinePools: {
            ...defaultMachinePools,
            data: [
              {
                ...machinePoolBehind1,
                version: { id: '4.12.10', available_upgrades: ['4.12.11'] },
              },
            ],
          },
        },
      };

      const rawControlPlaneVersion = semver.coerce(clusterVersionID);
      // Verify test data that machine pools is behind the control plane
      expect(
        semver.gt(
          rawControlPlaneVersion || '',
          semver.coerce(newState.machinePools.getMachinePools.data[0].version.id) || '',
        ),
      ).toBeTruthy();

      // Verify test data that control plane version is not in available upgrades
      expect(
        newState.machinePools.getMachinePools.data[0].version.available_upgrades,
      ).not.toContain(rawControlPlaneVersion?.version);

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when machine pools are scheduled to be upgraded', () => {
      const newState = {
        ...defaultStore,
        machinePools: {
          getMachinePools: {
            ...defaultMachinePools,
            data: [
              {
                ...machinePoolBehind1,
                version: { id: '4.12.10', available_upgrades: ['4.12.13'] },
                upgradePolicies: { items: ['I am an upgrade policy object'] },
              },
            ],
          },
        },
      };

      const rawControlPlaneVersion = semver.coerce(clusterVersionID);
      // Verify test data that machine pools is behind the control plane
      expect(
        semver.gt(
          rawControlPlaneVersion || '',
          semver.coerce(newState.machinePools.getMachinePools.data[0].version.id) || '',
        ),
      ).toBeTruthy();

      // Verify test data that control plane version is  in available upgrades
      expect(newState.machinePools.getMachinePools.data[0].version.available_upgrades).toContain(
        rawControlPlaneVersion?.version,
      );

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    it('when there are errors getting pool schedules', () => {
      const newState = {
        ...defaultStore,
        machinePools: {
          getMachinePools: {
            ...defaultMachinePools,
            data: [
              {
                ...machinePoolBehind1,
                version: { id: '4.12.10', available_upgrades: ['4.12.13'] },
                upgradePolicies: { errorMessage: 'This is an error message' },
              },
            ],
          },
        },
      };

      const rawControlPlaneVersion = semver.coerce(clusterVersionID);
      // Verify test data that machine pools is behind the control plane
      expect(
        semver.gt(
          rawControlPlaneVersion || '',
          semver.coerce(newState.machinePools.getMachinePools.data[0].version.id) || '',
        ),
      ).toBeTruthy();

      // Verify test data that control plane version is  in available upgrades
      expect(newState.machinePools.getMachinePools.data[0].version.available_upgrades).toContain(
        rawControlPlaneVersion?.version,
      );

      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
        />,
      );

      expectUpdateButtonAbsence(container);
    });

    describe('when the control plane', () => {
      it('has available update versions', () => {
        const newState = {
          ...defaultStore,
          clusters: {
            details: {
              cluster: {
                ...defaultCluster,
                version: {
                  id: clusterVersionID,
                  available_upgrades: ['I am an upgrade object'],
                },
              },
            },
          },
        };

        const { container } = withState(newState).render(
          <UpdateAllMachinePools
            isMachinePoolError={false}
            isHypershift
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
            clusterId={clusterId}
          />,
        );

        expectUpdateButtonAbsence(container);
      });

      it('has a started OSD manual update schedule', () => {
        const newState = {
          ...defaultStore,
          clusterUpgrades: {
            schedules: {
              items: [
                { upgrade_type: 'OSD', schedule_type: 'manual', state: { value: 'started' } },
              ],
            },
          },
        };

        const { container } = withState(newState).render(
          <UpdateAllMachinePools
            isMachinePoolError={false}
            isHypershift={false}
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
            clusterId={clusterId}
          />,
        );

        expectUpdateButtonAbsence(container);
      });

      it(' has a delayed OSD manual update schedule', () => {
        const newState = {
          ...defaultStore,
          clusterUpgrades: {
            schedules: {
              items: [
                { upgrade_type: 'OSD', schedule_type: 'manual', state: { value: 'delayed' } },
              ],
            },
          },
        };

        const { container } = withState(newState).render(
          <UpdateAllMachinePools
            isMachinePoolError={false}
            isHypershift={false}
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
            clusterId={clusterId}
          />,
        );

        expectUpdateButtonAbsence(container);
      });

      it('has a started OSD automatic update schedule', () => {
        const newState = {
          ...defaultStore,
          clusterUpgrades: {
            schedules: {
              items: [
                { upgrade_type: 'OSD', schedule_type: 'automatic', state: { value: 'started' } },
              ],
            },
          },
        };

        const { container } = withState(newState).render(
          <UpdateAllMachinePools
            isMachinePoolError={false}
            isHypershift={false}
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
            clusterId={clusterId}
          />,
        );

        expectUpdateButtonAbsence(container);
      });

      it(' has a delayed OSD automatic update schedule', () => {
        const newState = {
          ...defaultStore,
          clusterUpgrades: {
            schedules: {
              items: [
                { upgrade_type: 'OSD', schedule_type: 'automatic', state: { value: 'delayed' } },
              ],
            },
          },
        };

        const { container } = withState(newState).render(
          <UpdateAllMachinePools
            isMachinePoolError={false}
            isHypershift={false}
            controlPlaneVersion={clusterVersionID}
            controlPlaneRawVersion={clusterVersionRawID}
            clusterId={clusterId}
          />,
        );

        expectUpdateButtonAbsence(container);
      });
    });
  });

  describe('shows the update link', () => {
    it('is accessible when update link is shown', async () => {
      const newState = {
        ...defaultStore,
      };
      const { container } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={[machinePoolBehind1, machinePoolBehind2]}
        />,
      );

      expectUpdateButtonPresence();
      await checkAccessibility(container);
    });

    it('shows update link  and control plane version if at least one machine pool is behind the control plane', async () => {
      // Arrange

      const newState = {
        ...defaultStore,
      };

      const { user } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={[machinePoolUpToDate1, machinePoolBehind1]}
        />,
      );
      expectUpdateButtonPresence();

      // Act
      await user.click(screen.getByLabelText('Warning alert details'));

      // Assert
      expect(
        within(screen.getByTestId(warningAlertTestId)).getByText('4.12.13', {
          exact: false,
        }),
      ).toBeInTheDocument();
    });

    it('with multiple machine pools behind ', async () => {
      const newState = {
        ...defaultStore,
      };
      const machinePoolData = [
        {
          ...machinePoolBehind1,
          version: { id: '4.12.10', raw_id: '4.12.10', available_upgrades: ['4.12.13'] },
          upgradePolicies: { items: [] },
        },
        {
          ...machinePoolBehind2,
          version: { id: '4.12.10', raw_id: '4.12.10', available_upgrades: ['4.12.13'] },
          upgradePolicies: { items: [] },
        },
      ];
      const { user } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={machinePoolData}
        />,
      );
      expectUpdateButtonPresence();

      // Act
      await user.click(screen.getByRole('button', { name: 'Warning alert details' }));

      // Assert
      expect(
        within(screen.getByTestId('alert-warning')).getByText('4.12.13', {
          exact: false,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('updates the machine pools', () => {
    // This works because there is a single use of useDispatch (to get machinePools)
    const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

    afterEach(() => {
      useDispatchMock.mockClear();
      jest.resetAllMocks();
    });

    it('create node policy is called ', async () => {
      apiRequestMock.post.mockResolvedValue('success');
      const dummyDispatch = jest.fn();
      useDispatchMock.mockReturnValue(dummyDispatch);

      const newState = {
        ...defaultStore,
      };

      const machinePoolData = [
        {
          ...machinePoolBehind1,
          version: { id: '4.12.10', raw_id: '4.12.10', available_upgrades: ['4.12.13'] },
          upgradePolicies: { items: [] },
        },
        machinePoolUpToDate1,
      ];

      const { user } = withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={machinePoolData}
        />,
      );

      expect(apiRequestMock.post).not.toHaveBeenCalled();
      expect(dummyDispatch).toHaveBeenCalledTimes(0);
      expectUpdateButtonPresence();

      // ACT
      await clickUpdateButton(user);

      // ASSERT
      expect(apiRequestMock.post).toHaveBeenCalledTimes(1);
      const mockPostMachinePoolCallParams = apiRequestMock.post.mock.calls[0];

      expect(mockPostMachinePoolCallParams[0]).toEqual(
        `/api/clusters_mgmt/v1/clusters/${clusterId}/node_pools/${machinePoolBehind1.id}/upgrade_policies`,
      );

      const payload: NodePoolUpgradePolicy =
        mockPostMachinePoolCallParams[1] as NodePoolUpgradePolicy;
      expect(payload.schedule_type).toBe('manual');
      expect(payload.version).toBe('4.12.13');
      expect(payload.upgrade_type).toBe('NodePool');

      // Ensure dispatch call to get current state of machine pools
      expect(refetchMachineOrNodePoolsQuery).toHaveBeenCalledTimes(1);
    });

    it('hides error messages when user clicks to update all machine pools', async () => {
      // ARRANGE
      apiRequestMock.post.mockResolvedValue('success');
      const dummyDispatch = jest.fn();
      useDispatchMock.mockReturnValue(dummyDispatch);

      const newState = {
        ...defaultStore,
      };

      const { user } = withState(newState).render(
        <UpdateAllMachinePools
          initialErrorMessage="This is an error"
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={[machinePoolBehind1]}
        />,
      );
      expectUpdateButtonPresence();
      expect(screen.getByTestId(errorAlertTestId)).toBeInTheDocument();

      // ACT
      await clickUpdateButton(user);

      // ASSERT
      expect(screen.queryByTestId(errorAlertTestId)).not.toBeInTheDocument();
    });
  });

  describe('link to machine tab', () => {
    it('shows when goToMachinePoolTab prop is set', () => {
      const newState = {
        ...defaultStore,
      };
      withState(newState).render(
        <UpdateAllMachinePools
          goToMachinePoolTab
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={[machinePoolUpToDate1, machinePoolBehind1]}
        />,
      );

      expectUpdateButtonAbsence();
      expect(
        within(screen.getByTestId(warningAlertTestId)).getByRole('link', {
          name: goToMachinePoolText,
        }),
      ).toBeInTheDocument();
    });

    it('is hidden when goToMachinePoolTab is not set', () => {
      const newState = {
        ...defaultStore,
      };
      withState(newState).render(
        <UpdateAllMachinePools
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={[machinePoolUpToDate1, machinePoolBehind1]}
        />,
      );

      expectUpdateButtonPresence();
      expect(
        within(screen.getByTestId(warningAlertTestId)).queryByRole('link', {
          name: goToMachinePoolText,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('learn more link', () => {
    it('is the correct link when hypershift', async () => {
      const newState = {
        ...defaultStore,
      };
      const { user } = withState(newState).render(
        <UpdateAllMachinePools
          goToMachinePoolTab
          isMachinePoolError={false}
          isHypershift
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
          clusterId={clusterId}
          machinePoolData={[machinePoolUpToDate1, machinePoolBehind1]}
        />,
      );

      const toggle = screen.getByLabelText('Warning alert details');
      await user.click(toggle);

      const link = screen.getByText('Learn more about updates');
      expect(link).toHaveAttribute('href', links.ROSA_UPGRADES);
    });
  });
});
