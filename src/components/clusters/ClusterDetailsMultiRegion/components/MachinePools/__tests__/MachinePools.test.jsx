import React from 'react';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { ENABLE_MACHINE_CONFIGURATION } from '~/queries/featureGates/featureConstants';
import { baseRequestState } from '~/redux/reduxHelpers';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import { useFetchMachineTypes } from '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import { useDeleteMachinePool } from '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/useDeleteMachinePool';
import { useFetchMachineOrNodePools } from '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import clusterStates from '../../../../common/clusterStates';
import MachinePools from '../MachinePools';
import {
  hasMachinePoolsQuotaSelector,
  hasOrgLevelAutoscaleCapability,
  hasOrgLevelBypassPIDsLimitCapability,
} from '../machinePoolsSelectors';
import * as selectors from '../UpdateMachinePools/updateMachinePoolsHelpers';

jest.mock('../UpdateMachinePools/updateMachinePoolsHelpers');

const vpc = {
  aws_security_groups: [
    {
      name: '',
      id: 'sg-group-without-a-name',
    },
    {
      name: 'abc is my name',
      id: 'sg-abc',
    },
  ],
};

jest.mock('~/components/clusters/common/useAWSVPCFromCluster', () => ({
  useAWSVPCFromCluster: () => ({
    clusterVpc: vpc,
  }),
}));
jest.mock('~/components/clusters/common/MachineConfiguration', () => ({
  MachineConfiguration: () => <div data-testid="machine-configuration">MachineConfiguration</div>,
}));

jest.mock(
  '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools',
  () => ({
    useFetchMachineOrNodePools: jest.fn(),
  }),
);
jest.mock(
  '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes',
  () => ({
    useFetchMachineTypes: jest.fn(),
  }),
);
jest.mock(
  '../../../../../../queries/ClusterDetailsQueries/MachinePoolTab/useDeleteMachinePool',
  () => ({
    useDeleteMachinePool: jest.fn(),
  }),
);
jest.mock('../machinePoolsSelectors', () => ({
  hasMachinePoolsQuotaSelector: jest.fn(),
  hasOrgLevelAutoscaleCapability: jest.fn(),
  hasOrgLevelBypassPIDsLimitCapability: jest.fn(),
}));

const openModal = jest.fn();
const getOrganizationAndQuota = jest.fn();

const defaultMachinePool = {
  id: 'some-id',
  instance_type: 'm5.xlarge',
  availability_zones: ['us-east-1'],
  desired: 1,
};

const defaultCluster = {
  id: 'my-cluster-id',
  product: {
    id: normalizedProducts.ROSA,
  },
  machinePoolsActions: {
    create: true,
    update: true,
    delete: true,
    edit: true,
    list: true,
  },
  kubeletConfigActions: {
    create: true,
    update: true,
    get: true,
    list: true,
    delete: true,
  },
  hypershift: {
    enabled: false,
  },
  ccs: {
    enabled: false,
  },
  cloud_provider: {
    id: 'aws',
  },
  state: clusterStates.ready,
};

const defaultProps = {
  cluster: defaultCluster,
  openModal,
  isDeleteMachinePoolModalOpen: false,
  isAddMachinePoolModalOpen: false,
  isEditTaintsModalOpen: false,
  isEditLabelsModalOpen: false,
  isClusterAutoscalingModalOpen: false,
  clusterAutoscalerResponse: {
    hasAutoscaler: false,
    getAutoscaler: { ...baseRequestState },
    editAction: { ...baseRequestState },
  },
  deleteMachinePoolResponse: { ...baseRequestState },
  machinePoolsList: { ...baseRequestState, data: [defaultMachinePool] },
  clearGetMachinePoolsResponse: jest.fn(),
  getClusterAutoscaler: jest.fn(),
  getOrganizationAndQuota,
  machineTypes: {},
  hasMachinePoolsQuota: true,
  clearDeleteMachinePoolResponse: jest.fn(),
  hasMachineConfiguration: false,
};

const simpleMachinePoolList = {
  data: [
    {
      availability_zones: ['us-east-1a'],
      href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/test-mp',
      id: 'test-mp',
      instance_type: 'm5.xlarge',
      kind: 'MachinePool',
      replicas: 1,
    },
  ],
};

describe('<MachinePools />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const useFetchMachineTypesMock = useFetchMachineTypes;
  const useFetchMachineOrNodePoolsMock = useFetchMachineOrNodePools;
  const useDeleteMachinePoolMock = useDeleteMachinePool;
  const hasOrgLevelAutoscaleCapabilityMock = hasOrgLevelAutoscaleCapability;
  const hasOrgLevelBypassPIDsLimitCapabilityMock = hasOrgLevelBypassPIDsLimitCapability;
  describe('renders', () => {
    useDeleteMachinePoolMock.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
    });
    useFetchMachineOrNodePoolsMock.mockReturnValue({
      isLoading: false,
      data: simpleMachinePoolList?.data,
      isError: false,
      error: {
        error: null,
      },
      refetch: jest.fn(),
      isRefetching: jest.fn(),
    });
    useFetchMachineTypesMock.mockReturnValue({
      data: {
        types: {
          aws: [
            {
              id: 'm5.xlarge',
              cpu: {
                value: 4,
              },
              memory: {
                value: 4,
              },
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    hasOrgLevelBypassPIDsLimitCapabilityMock.mockReturnValue(true);
    hasOrgLevelAutoscaleCapabilityMock.mockReturnValue(false);
    it('should call getMachinePools on mount', async () => {
      render(<MachinePools {...defaultProps} />);
      // Wait for the component to fully render and all async updates to complete
      await screen.findByText('test-mp');
      expect(useFetchMachineOrNodePoolsMock).toHaveBeenCalled();
      expect(useFetchMachineTypesMock).toHaveBeenCalled();
    });

    it('the machine pool ID', async () => {
      render(<MachinePools {...defaultProps} />);
      expect(await screen.findByText('test-mp')).toBeInTheDocument();
    });

    it('the machine pool labels', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            ...simpleMachinePoolList?.data[0],
            labels: { foo: 'bar', hello: 'world' },
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const newProps = {
        ...defaultProps,
      };
      render(<MachinePools {...newProps} />);
      expect(await screen.findByText('foo = bar')).toHaveClass('pf-v6-c-label__text');
    });

    // // TODO: to not skip once TableDeprecated is removed
    it('is accessible with additional machine pools, some with labels and/or taints', async () => {
      const machinePoolsData = [
        {
          availability_zones: ['us-east-1a'],
          href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-labels-and-taints',
          id: 'mp-with-labels-and-taints',
          instance_type: 'm5.xlarge',
          kind: 'MachinePool',
          labels: { foo: 'bar' },
          replicas: 1,
          taints: [
            { key: 'foo1', value: 'bazz1', effect: 'NoSchedule' },
            { key: 'foo2', value: 'bazz2', effect: 'NoSchedule' },
          ],
        },
        {
          availability_zones: ['us-east-1a'],
          href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-labels',
          id: 'mp-with-label',
          instance_type: 'm5.xlarge',
          kind: 'MachinePool',
          labels: { foo: 'bar' },
          replicas: 1,
        },
        {
          availability_zones: ['us-east-1a'],
          href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-taints',
          id: 'mp-with-taints',
          instance_type: 'm5.xlarge',
          kind: 'MachinePool',
          replicas: 1,
          taints: [
            { key: 'foo1', value: 'bazz1', effect: 'NoSchedule' },
            { key: 'foo2', value: 'bazz2', effect: 'NoSchedule' },
          ],
        },
        {
          availability_zones: ['us-east-1a'],
          href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-no-labels-no-taints',
          id: 'mp-with-no-labels-no-taints',
          instance_type: 'm5.xlarge',
          kind: 'MachinePool',
          replicas: 1,
        },
      ];
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: machinePoolsData,
        isError: false,
        error: {
          error: null,
        },
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const newProps = {
        ...defaultProps,
        machinePoolsList: {
          data: machinePoolsData,
        },
      };
      const { container } = render(<MachinePools {...newProps} />);
      expect(await screen.findByText('mp-with-labels-and-taints')).toBeInTheDocument();
      expect(await screen.findByText('mp-with-label')).toBeInTheDocument();
      expect(await screen.findByText('mp-with-taints')).toBeInTheDocument();
      expect(await screen.findByText('mp-with-no-labels-no-taints')).toBeInTheDocument();
      await checkAccessibility(container);
    });

    it('with a machine pool with autoscaling enabled', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            autoscaling: { max_replicas: 2, min_replicas: 1 },
            availability_zones: ['us-east-1a'],
            href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-autoscaling',
            id: 'mp-autoscaling',
            instance_type: 'm5.xlarge',
            kind: 'MachinePool',
            labels: { foo: 'bar' },
            taints: [
              { key: 'foo1', value: 'bazz1', effect: 'NoSchedule' },
              { key: 'foo2', value: 'bazz2', effect: 'NoSchedule' },
            ],
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });

      render(<MachinePools {...defaultProps} />);
      expect(await screen.findByText('mp-autoscaling')).toBeInTheDocument();
      const minNodes = await screen.findByText('Min nodes');
      expect(minNodes.closest('div')).toHaveTextContent('Min nodes 1');
      const maxNodes = await screen.findByText('Max nodes');
      expect(maxNodes.closest('div')).toHaveTextContent('Max nodes 2');
    });

    it('should render skeleton while fetching machine pools', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: true,
        data: undefined,
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const newProps = {
        ...defaultProps,
      };

      const { container } = render(<MachinePools {...newProps} />);
      expect(container.querySelectorAll('.pf-v6-c-skeleton').length).toBeGreaterThan(0);

      await checkAccessibility(container);
    });

    it('OpenShift version for machine pools is shown if hypershift', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
            version: {
              kind: 'VersionLink',
              id: 'openshift-v4.12.5-candidate',
              href: '/api/clusters_mgmt/v1/versions/openshift-v4.12.5-candidate',
            },
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const newProps = {
        ...defaultProps,
        cluster: {
          ...defaultCluster,
          hypershift: {
            enabled: true,
          },
        },
      };
      render(<MachinePools {...newProps} />);

      expect(await screen.findByText('4.12.5-candidate')).toBeInTheDocument();
    });

    it('should render error message', async () => {
      useDeleteMachinePoolMock.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: true,
        isSuccess: false,
        error: {
          error: {
            errorMessage: 'testError',
          },
        },
      });
      const newProps = {
        ...defaultProps,
      };
      render(<MachinePools {...newProps} />);
      expect(await screen.findByTestId('alert-error')).toBeInTheDocument();
    });
  });

  describe('add machine pool', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const hasMachinePoolsQuotaSelectorMock = hasMachinePoolsQuotaSelector;
    it('should open modal', async () => {
      hasMachinePoolsQuotaSelectorMock.mockReturnValue(true);
      const { user } = render(<MachinePools {...defaultProps} />);
      expect(
        screen.queryByRole('dialog', { name: 'Add machine pool Add machine pool' }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Add machine pool' }));

      // TODO: The name of the modal should be changed - this is an accessibility issues
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Add machine pool' })).toBeInTheDocument();
    });

    it('should not allow adding machine pools to users without enough quota', async () => {
      hasMachinePoolsQuotaSelectorMock.mockReturnValue(false);
      const newProps = { ...defaultProps };
      render(<MachinePools {...newProps} />);

      // Wait for the button to be rendered and all async updates to complete
      const button = await screen.findByRole('button', { name: 'Add machine pool' });

      // TODO: The button is not correctly disabled - this is an accessibility issue and should be fixed
      // expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('machine pool table actions', () => {
    const hasMachinePoolsQuotaSelectorMock = hasMachinePoolsQuotaSelector;
    it('Should enable all actions in kebab menu if hypershift', async () => {
      useDeleteMachinePoolMock.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
      });
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'additional-np',
            replicas: 3,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 3,
            },
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      useFetchMachineTypesMock.mockReturnValue({
        data: {
          types: {
            aws: [
              {
                id: 'm5.xlarge',
                cpu: {
                  value: 4,
                },
                memory: {
                  value: 4,
                },
              },
            ],
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      const newProps = {
        ...defaultProps,
        cluster: {
          ...defaultCluster,
          hypershift: {
            enabled: true,
          },
        },
      };

      const { user, container } = render(<MachinePools {...newProps} />);
      expect(screen.getAllByRole('button', { name: 'Kebab toggle' })).toHaveLength(2);

      screen.getAllByRole('button', { name: 'Kebab toggle' }).forEach(async (button) => {
        await user.click(button);
        const menuItems = container.querySelectorAll(
          '.pf-v6-c-dropdown__menu .pf-v6-c-dropdown__menu-item',
        );
        menuItems.forEach((item) => {
          expect(item).not.toHaveAttribute('aria-disabled');
        });
      });
    });

    it('Should disable delete action in kebab menu if there is only one node pool and hypershift is true', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const newProps = {
        ...defaultProps,
        cluster: {
          ...defaultCluster,
          hypershift: {
            enabled: true,
          },
        },
      };

      const { user } = render(<MachinePools {...newProps} />);

      // TODO: Investigate why it fails with single user.click
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));
      await user.click(screen.getByLabelText(/Kebab toggle/));
      // TODO, the menu item is not properly disabled - this is is an accessibility issue
      // expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('Should enable all actions in kebab menu if hypershift is false', async () => {
      useDeleteMachinePoolMock.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
      });
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers1',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      useFetchMachineTypesMock.mockReturnValue({
        data: {
          types: {
            aws: [
              {
                id: 'm5.xlarge',
                cpu: {
                  value: 4,
                },
                memory: {
                  value: 4,
                },
              },
            ],
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      const newProps = {
        ...defaultProps,
        cluster: {
          ...defaultCluster,
          ccs: { enabled: true },
        },
      };

      const { user, container } = render(<MachinePools {...newProps} />);
      // Wait for buttons to appear and all async updates to complete
      const kebabButtons = await screen.findAllByRole('button', { name: 'Kebab toggle' });
      expect(kebabButtons).toHaveLength(2);

      // Click each button sequentially to avoid conflicts
      const clickAndCheck = async (button) => {
        await user.click(button);
        const menuItems = container.querySelectorAll(
          '.pf-v6-c-dropdown__menu .pf-v6-c-dropdown__menu-item',
        );
        menuItems.forEach((item) => {
          expect(item).not.toHaveAttribute('aria-disabled');
        });
      };
      await clickAndCheck(kebabButtons[0]);
      await clickAndCheck(kebabButtons[1]);
    });

    it('displays option to update machine pool if machine pool can be updated ', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
            version: {
              kind: 'VersionLink',
              id: 'openshift-v4.12.5-candidate',
              href: '/api/clusters_mgmt/v1/versions/openshift-v4.12.5-candidate',
            },
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      useFetchMachineTypesMock.mockReturnValue({
        data: {
          types: {
            aws: [
              {
                id: 'm5.xlarge',
                cpu: {
                  value: 4,
                },
                memory: {
                  value: 4,
                },
              },
            ],
          },
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultCluster,
          hypershift: {
            enabled: true,
          },
        },
      };
      selectors.canMachinePoolBeUpgradedSelector.mockImplementation(() => true);
      const { user } = render(<MachinePools {...props} />);

      // TODO: Investigate why it fails if one user click
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));
      expect(screen.getByRole('menuitem', { name: 'Update version' })).toBeInTheDocument();
    });

    it('hides option to update machine pool if machine pool cannot be updated', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
            version: {
              kind: 'VersionLink',
              id: 'openshift-v4.12.5-candidate',
              href: '/api/clusters_mgmt/v1/versions/openshift-v4.12.5-candidate',
            },
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultCluster,
          hypershift: {
            enabled: true,
          },
        },
      };
      selectors.canMachinePoolBeUpgradedSelector.mockImplementation(() => false);
      const { user } = render(<MachinePools {...props} />);

      // TODO: Investigate why it fails on single click
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));
      expect(screen.getAllByRole('menuitem').length).not.toEqual(0);
      expect(screen.queryByRole('menuitem', { name: 'Update version' })).not.toBeInTheDocument();
    });

    it('Should disable actions on machine pools if user does not have permissions', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            availability_zones: ['us-east-1a'],
            href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/test-mp',
            id: 'test-mp',
            instance_type: 'm5.xlarge',
            kind: 'MachinePool',
            replicas: 1,
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          hypershift: {
            enabled: true,
          },
          machinePoolsActions: {
            create: false,
            update: false,
            delete: false,
            edit: false,
            list: true,
          },
        },
      };
      render(<MachinePools {...props} />);
      // Wait for the button to be rendered and all async updates to complete
      const addButton = await screen.findByRole('button', { name: 'Add machine pool' });
      expect(addButton).toHaveAttribute('aria-disabled', 'true');
      // table actions are disabled
      const kebabButton = await screen.findByRole('button', { name: 'Kebab toggle' });
      expect(kebabButton).toBeDisabled();
    });

    it('Should disable delete action if user does not have permissions', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            availability_zones: ['us-east-1a'],
            href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/test-mp',
            id: 'test-mp',
            instance_type: 'm5.xlarge',
            kind: 'MachinePool',
            replicas: 1,
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultProps.cluster,
          hypershift: {
            enabled: true,
          },
          machinePoolsActions: {
            create: false,
            update: true,
            delete: false,
            edit: true,
            list: true,
          },
        },
      };
      const { user } = render(<MachinePools {...props} />);

      // TODO: Investigate why it fails on single click
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));
      await user.click(screen.getByRole('button', { name: 'Kebab toggle' }));
      expect(screen.queryByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('Should allow actions on machine pools if user has permissions', async () => {
      useFetchMachineOrNodePoolsMock.mockReturnValue({
        isLoading: false,
        data: [
          {
            availability_zones: ['us-east-1a'],
            href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/test-mp',
            id: 'test-mp',
            instance_type: 'm5.xlarge',
            kind: 'MachinePool',
            replicas: 1,
          },
        ],
        isError: false,
        error: null,
        refetch: jest.fn(),
        isRefetching: jest.fn(),
      });
      hasMachinePoolsQuotaSelectorMock.mockReturnValue(true);
      const props = {
        ...defaultProps,
        cluster: {
          ...defaultCluster,
          hypershift: {
            enabled: true,
          },
        },
      };
      render(<MachinePools {...props} />);
      // Wait for the button to be rendered and all async updates to complete
      const addButton = await screen.findByRole('button', { name: 'Add machine pool' });
      expect(addButton).not.toHaveAttribute('aria-disabled');
      // table actions are enabled
      const kebabButton = await screen.findByRole('button', { name: 'Kebab toggle' });
      expect(kebabButton).toBeEnabled();
    });
  });

  it('Should render successfully when machinePoolsActions is unset (rendering from cluster list data)', async () => {
    useFetchMachineOrNodePoolsMock.mockReturnValue({
      isLoading: false,
      data: simpleMachinePoolList.data,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: jest.fn(),
    });
    const props = {
      ...defaultProps,
      cluster: {
        ...defaultCluster,
        hypershift: {
          enabled: true,
        },
        machinePoolsActions: undefined,
      },
    };

    render(<MachinePools {...props} />);
    // Wait for the button to be rendered and all async updates to complete
    const addButton = await screen.findByRole('button', { name: 'Add machine pool' });
    expect(addButton).toHaveAttribute('aria-disabled', 'true');
    // the table does not become rendered because "list" permission is missing
    expect(screen.queryByRole('grid', { name: 'Machine pools' })).not.toBeInTheDocument();
  });

  describe('Machine configuration', () => {
    mockUseFeatureGate([[ENABLE_MACHINE_CONFIGURATION, true]]);
    const machineConfigLabel = 'Edit machine configuration';
    const expectActionButton = async ({ toBePresent, toBeEnabled = true }) => {
      if (toBePresent) {
        const button = await screen.findByRole('button', { name: machineConfigLabel });
        expect(button).toBeInTheDocument();
        if (toBeEnabled === true) {
          expect(button).not.toHaveAttribute('aria-disabled');
        } else {
          expect(button).toHaveAttribute('aria-disabled', `${String(!toBeEnabled)}`);
        }
      } else {
        expect(screen.queryByRole('button', { name: machineConfigLabel })).not.toBeInTheDocument();
      }
    };

    it('is present for ROSA cluster', async () => {
      mockUseFeatureGate([[ENABLE_MACHINE_CONFIGURATION, true]]);
      const props = { ...defaultProps };
      render(<MachinePools {...props} />);

      await expectActionButton({ toBePresent: true });
    });

    it('is present if cluster is OSD with CCS on AWS', async () => {
      const props = {
        ...defaultProps,
        hasMachineConfiguration: true,
        cluster: {
          ...defaultCluster,
          product: {
            id: normalizedProducts.OSD,
          },
          ccs: {
            enabled: true,
          },
          subscription: {
            cloud_provider_id: 'aws',
          },
        },
      };
      render(<MachinePools {...props} />);

      await expectActionButton({ toBePresent: true });
    });

    it('is present but disabled if the cluster is not in "ready" state', async () => {
      const props = {
        ...defaultProps,
        hasMachineConfiguration: true,
        cluster: {
          ...defaultCluster,
          state: clusterStates.hibernating,
        },
      };
      render(<MachinePools {...props} />);

      await expectActionButton({ toBePresent: true, toBeEnabled: false });
    });

    it("is present but disabled if user doesn't have the proper rights", async () => {
      const props = {
        ...defaultProps,
        hasMachineConfiguration: true,
        cluster: {
          ...defaultCluster,
          state: clusterStates.hibernating,
          kubeletConfigActions: {
            ...defaultCluster.kubeletConfigActions,
            create: false,
            update: false,
          },
        },
      };
      render(<MachinePools {...props} />);

      await expectActionButton({ toBePresent: true, toBeEnabled: false });
    });

    it('is absent if cluster is OSD with CCS on GCP', async () => {
      const props = {
        ...defaultProps,
        hasMachineConfiguration: true,
        cluster: {
          ...defaultCluster,
          product: {
            id: normalizedProducts.OSD,
          },
          ccs: {
            enabled: true,
          },
          subscription: {
            cloud_provider_id: 'gcp',
          },
        },
      };
      render(<MachinePools {...props} />);
      // Wait for component to render and all async updates to complete
      await screen.findByText('test-mp');

      await expectActionButton({ toBePresent: false });
    });

    it('is absent if cluster is OSD without CCS', async () => {
      const props = {
        ...defaultProps,
        hasMachineConfiguration: true,
        cluster: {
          ...defaultCluster,
          product: {
            id: normalizedProducts.OSD,
          },
          ccs: {
            enabled: false,
          },
          subscription: {
            cloud_provider_id: 'aws',
          },
        },
      };
      render(<MachinePools {...props} />);
      // Wait for component to render and all async updates to complete
      await screen.findByText('test-mp');

      await expectActionButton({ toBePresent: false });
    });

    it('is absent if cluster is Hypershift', async () => {
      const props = {
        ...defaultProps,
        hasMachineConfiguration: true,
        cluster: {
          ...defaultCluster,
          hypershift: {
            enabled: true,
          },
        },
      };
      render(<MachinePools {...props} />);
      // Wait for component to render and all async updates to complete
      await screen.findByText('test-mp');

      await expectActionButton({ toBePresent: false });
    });

    it('shows the machine configuration when clicking on "Edit machine configuration"', async () => {
      const props = { ...defaultProps, hasMachineConfiguration: true };
      const machineConfigurationTestID = 'machine-configuration';
      const { user } = render(<MachinePools {...props} />);

      const button = await screen.findByRole('button', { name: machineConfigLabel });
      expect(button).toBeInTheDocument();
      expect(screen.queryByTestId(machineConfigurationTestID)).not.toBeInTheDocument();

      await user.click(button);

      expect(await screen.findByTestId(machineConfigurationTestID)).toBeInTheDocument();
    });
  });
});
