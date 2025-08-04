import * as React from 'react';

import fixtures from '~/components/clusters/ClusterDetailsMultiRegion/__tests__/ClusterDetails.fixtures';
import { MAX_NODES_HCP } from '~/components/clusters/common/machinePools/constants';
import {
  AWS_TAGS_NEW_MP,
  GCP_SECURE_BOOT,
  IMDS_SELECTION,
  TABBED_MACHINE_POOL_MODAL,
} from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, within } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import EditMachinePoolModal from './EditMachinePoolModal';

const machinePoolsResponse = [
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
];

const gcpMachinePoolResponse = [
  {
    availability_zones: ['us-east1-b'],
    href: '/api/clusters_mgmt/v1/clusters/2j6c15idtf09ql5atgcbnop8tm1pr474/machine_pools/novm',
    id: 'novm',
    instance_type: 'n2-highmem-4',
    kind: 'MachinePool',
    replicas: 0,
  },
];

const machineTypesResponse = {
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
  typesByID: {
    'm5.xlarge': {
      id: 'm5.xlarge',
      cpu: {
        value: 4,
      },
      memory: {
        value: 4,
      },
    },
  },
};

const commonProps = {
  machinePoolsLoading: false,
  machinePoolsError: false,
  machineTypesLoading: false,
  machineTypesError: false,
  machineTypesErrorResponse: {},
  machinePoolsErrorResponse: {},
  machinePoolsResponse,
  machineTypesResponse,
};

const testCluster = {
  name: 'test-cluster-name',
  domain_prefix: 'domainPre1',
  subscription: {
    display_name: 'test-cluster-display-name',
  },
};

describe('<EditMachinePoolModal />', () => {
  describe('error state', () => {
    it('Shows alert if machine pools failed to load', async () => {
      render(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machinePoolsError
        />,
      );

      expect(
        within(await screen.findByRole('alert')).getByText(/Failed to fetch resources/),
      ).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Add machine pool' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });

    it('Shows alert if machine types failed to load', async () => {
      render(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machineTypesError
        />,
      );

      expect(
        within(await screen.findByRole('alert')).getByText(/Failed to fetch resources/),
      ).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Add machine pool' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });
  });

  describe('loading state', () => {
    const check = async () => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeDisabled();
      expect(screen.getByTestId('cancel-btn')).toBeEnabled();
    };

    it('Shows loading if machine pools are loading', async () => {
      // mockUseFeatureGate([[TABBED_MACHINE_POOL_MODAL, true]]);
      render(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machinePoolsLoading
        />,
      );
      await check();
    });

    it('Shows loading if machine types are loading', async () => {
      render(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machineTypesLoading
        />,
      );
      await check();
    });
  });

  describe('add machine pool', () => {
    it('Submit button shows `Add machine pool`', async () => {
      render(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
        />,
      );

      expect(await screen.findByRole('button', { name: 'Add machine pool' })).toBeInTheDocument();
    });

    it('Shows IMDS radio buttons with enabled feature gate AND NOT tabbed machine pool modal', async () => {
      mockUseFeatureGate([
        [IMDS_SELECTION, true],
        [TABBED_MACHINE_POOL_MODAL, false],
      ]);
      const { user } = render(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          isHypershift
          onClose={() => {}}
          {...commonProps}
        />,
      );

      const imdsV1AndV2Radio = screen.getByRole('radio', { name: /Use both IMDSv1 and IMDSv2/i });
      const imdsV2Radio = screen.getByRole('radio', { name: /Use IMDSv2 only/i });

      expect(imdsV1AndV2Radio).toBeChecked();
      expect(imdsV2Radio).not.toBeChecked();

      await user.click(imdsV2Radio);

      expect(imdsV2Radio).toBeChecked();
      expect(imdsV1AndV2Radio).not.toBeChecked();
    });

    it('Shows IMDS radio buttons with enabled feature gate AND tabbed machine pool modal', async () => {
      mockUseFeatureGate([
        [IMDS_SELECTION, true],
        [TABBED_MACHINE_POOL_MODAL, true],
      ]);
      const { user } = render(
        <EditMachinePoolModal
          cluster={{ hypershift: { enabled: true } } as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
        />,
      );

      await screen.findAllByRole('radio');

      const imdsV1AndV2Radio = screen.getByRole('radio', { name: /Use both IMDSv1 and IMDSv2/i });
      const imdsV2Radio = screen.getByRole('radio', { name: /Use IMDSv2 only/i });

      expect(imdsV1AndV2Radio).toBeChecked();
      expect(imdsV2Radio).not.toBeChecked();

      await user.click(imdsV2Radio);

      expect(imdsV2Radio).toBeChecked();
      expect(imdsV1AndV2Radio).not.toBeChecked();
    });

    describe('tabs', () => {
      it('shows the maintenance subtab if hypershift cluster', async () => {
        mockUseFeatureGate([[TABBED_MACHINE_POOL_MODAL, true]]);
        const { user } = render(
          <EditMachinePoolModal
            cluster={{ hypershift: { enabled: true } } as ClusterFromSubscription}
            onClose={() => {}}
            {...commonProps}
          />,
        );

        expect(await screen.findByRole('tab', { name: 'Maintenance' })).toBeInTheDocument();
        expect(screen.queryByLabelText('Enable AutoRepair')).not.toBeVisible();

        await user.click(screen.getByRole('tab', { name: 'Maintenance' }));
        expect(screen.getByLabelText('Enable AutoRepair')).toBeVisible();
      });

      it('hides the maintenance subtab if not hypershift cluster', async () => {
        mockUseFeatureGate([[TABBED_MACHINE_POOL_MODAL, true]]);
        render(
          <EditMachinePoolModal
            cluster={{ hypershift: { enabled: false } } as ClusterFromSubscription}
            onClose={() => {}}
            {...commonProps}
          />,
        );

        expect(await screen.findByRole('tab', { name: 'Overview' })).toBeInTheDocument();
        expect(screen.queryByRole('tab', { name: 'Maintenance' })).not.toBeInTheDocument();
      });

      it('shows the labels and tags subtab', async () => {
        mockUseFeatureGate([
          [TABBED_MACHINE_POOL_MODAL, true],
          [AWS_TAGS_NEW_MP, false],
        ]);
        const { user } = render(
          <EditMachinePoolModal
            cluster={{} as ClusterFromSubscription}
            onClose={() => {}}
            {...commonProps}
          />,
        );
        expect(await screen.findByRole('tab', { name: 'Labels and Taints' })).toBeInTheDocument();
        expect(screen.queryByText('Taints')).not.toBeVisible();

        await user.click(screen.getByRole('tab', { name: 'Labels and Taints' }));
        expect(screen.getByText('Taints')).toBeVisible();
      });

      it('shows the security groups subtab if AWS with subnets', async () => {
        mockUseFeatureGate([[TABBED_MACHINE_POOL_MODAL, true]]);
        const { user } = render(
          <EditMachinePoolModal
            cluster={
              {
                cloud_provider: { id: 'aws' },
                aws: { subnet_ids: ['subnet-my-subnet-id'] },
              } as unknown as ClusterFromSubscription
            }
            onClose={() => {}}
            isEdit
            {...commonProps}
          />,
        );

        expect(await screen.findByRole('tab', { name: 'Security groups' })).toBeInTheDocument();

        expect(
          screen.queryByText(/This option cannot be edited from its original setting selection/),
        ).not.toBeVisible();

        await user.click(screen.getByRole('tab', { name: 'Security groups' }));
        expect(
          screen.getByText(/This option cannot be edited from its original setting selection/),
        ).toBeVisible();
      });

      it('hides the security groups subtab if not aws', async () => {
        mockUseFeatureGate([[TABBED_MACHINE_POOL_MODAL, true]]);
        render(
          <EditMachinePoolModal
            cluster={
              {
                cloud_provider: { id: 'gcp' },
              } as unknown as ClusterFromSubscription
            }
            onClose={() => {}}
            {...commonProps}
          />,
        );

        expect(await screen.findByRole('tab', { name: 'Overview' })).toBeInTheDocument();

        expect(screen.queryByRole('tab', { name: 'Security groups' })).not.toBeInTheDocument();
      });

      it('shows the cost savings subtab if ROSA classic', async () => {
        mockUseFeatureGate([[TABBED_MACHINE_POOL_MODAL, true]]);
        const { user } = render(
          <EditMachinePoolModal
            cluster={
              {
                product: { id: 'ROSA' },
                cloud_provider: { id: 'aws' },
                hypershift: { enabled: false },
              } as ClusterFromSubscription
            }
            onClose={() => {}}
            {...commonProps}
          />,
        );

        expect(await screen.findByRole('tab', { name: 'Cost savings' })).toBeInTheDocument();
        expect(screen.queryByLabelText('Use Amazon EC2 Spot Instance')).not.toBeVisible();

        await user.click(screen.getByRole('tab', { name: 'Cost savings' }));

        expect(screen.getByLabelText('Use Amazon EC2 Spot Instance')).toBeVisible();
      });

      it('hides the cost savings subtab if ROSA hypershift', async () => {
        mockUseFeatureGate([[TABBED_MACHINE_POOL_MODAL, true]]);
        render(
          <EditMachinePoolModal
            cluster={
              {
                product: { id: 'ROSA' },
                cloud_provider: { id: 'aws' },
                hypershift: { enabled: true },
              } as ClusterFromSubscription
            }
            onClose={() => {}}
            {...commonProps}
          />,
        );

        expect(await screen.findByRole('tab', { name: 'Overview' })).toBeInTheDocument();
        expect(screen.queryByRole('tab', { name: 'Cost savings' })).not.toBeInTheDocument();
      });
    });
  });
  describe('edit machine pool', () => {
    it('shows subscription display name when displayClusterName is true', async () => {
      render(
        <EditMachinePoolModal
          cluster={testCluster as unknown as ClusterFromSubscription}
          onClose={() => {}}
          shouldDisplayClusterName
          {...commonProps}
        />,
      );

      expect(screen.queryByText('test-cluster-name')).not.toBeInTheDocument();
      expect(await screen.findByText('test-cluster-display-name')).toBeInTheDocument();
    });

    it('Submit button shows `Save`', async () => {
      const { rerender } = render(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          isEdit
        />,
      );

      expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();

      rerender(
        <EditMachinePoolModal
          cluster={{} as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machinePoolId="foo"
        />,
      );

      expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    describe('Singlezone and multizone machine pool in multizone cluster', () => {
      it('Loaded state with single zone machinepool', async () => {
        render(
          <EditMachinePoolModal
            cluster={{ multi_az: true } as ClusterFromSubscription}
            onClose={() => {}}
            {...commonProps}
            machinePoolsResponse={[
              {
                availability_zones: ['us-east-1a'],
                href: '/api/clusters_mgmt/v1/clusters/282fg0gt74jjb9558ge1poe8m4dlvb07/machine_pools/daznauro-mp',
                id: 'fooId',
                instance_type: 'm5.xlarge',
                kind: 'MachinePool',
                replicas: 21,
                root_volume: { aws: { size: 300 } },
              },
            ]}
            machinePoolId="fooId"
          />,
        );

        expect(await screen.findByText('Compute node count')).toBeInTheDocument();
        expect(await screen.findByText('21')).toBeInTheDocument();
      });

      it('Loaded state with multi zone machinepool', async () => {
        render(
          <EditMachinePoolModal
            cluster={{ multi_az: true } as ClusterFromSubscription}
            onClose={() => {}}
            {...commonProps}
            machinePoolsResponse={[
              {
                availability_zones: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
                href: '/api/clusters_mgmt/v1/clusters/282fg0gt74jjb9558ge1poe8m4dlvb07/machine_pools/daznauro-mp',
                id: 'fooId',
                instance_type: 'm5.xlarge',
                kind: 'MachinePool',
                replicas: 21,
                root_volume: { aws: { size: 300 } },
              },
            ]}
            machinePoolId="fooId"
          />,
        );

        expect(await screen.findByText('Compute node count (per zone)')).toBeInTheDocument();
        expect(await screen.findByText('7')).toBeInTheDocument();
      });
    });
  });

  describe('ROSA Hypershift cluster machine pool', () => {
    it('Disabled Add Machine Pool button on max replicas', async () => {
      // Render
      const { user } = render(
        <EditMachinePoolModal
          cluster={
            {
              multi_az: false,
              hypershift: { enabled: true },
              product: { id: 'ROSA' },
            } as ClusterFromSubscription
          }
          onClose={() => {}}
          isHypershift
          {...commonProps}
          machinePoolsResponse={[
            {
              availability_zones: ['us-east-1a'],
              href: '/api/clusters_mgmt/v1/clusters/282fg0gt74jjb9558ge1poe8m4dlvb07/machine_pools/daznauro-mp',
              id: 'fooId',
              instance_type: 'm5.xlarge',
              kind: 'MachinePool',
              replicas: MAX_NODES_HCP,
              root_volume: { aws: { size: 300 } },
            },
            {
              availability_zones: ['us-east-1a'],
              href: '/api/clusters_mgmt/v1/clusters/282fg0gt74jjb9558ge1poe8m4dlvb07/machine_pools/daznauro-mp',
              id: 'fooId2',
              instance_type: 'm5.xlarge',
              kind: 'MachinePool',
              autoscaling: {
                min_replicas: 1,
                max_replicas: 2,
              },
              root_volume: { aws: { size: 300 } },
            },
          ]}
        />,
      );

      // Act
      const inputField = await screen.findByRole('textbox');
      await user.type(inputField, 'test');

      const autoScalingCheckbox = await screen.findByRole('checkbox', {
        name: 'Enable autoscaling',
      });

      await user.click(autoScalingCheckbox);

      // Assert
      expect(screen.getAllByRole('button', { name: 'Plus' })[1]).toBeDisabled();
      expect(await screen.findByTestId('submit-btn')).toBeDisabled();
    });
  });

  describe('GCP cluster machine pool', () => {
    beforeEach(() => {
      mockUseFeatureGate([[GCP_SECURE_BOOT, true]]);
    });

    const { OSDGCPClusterDetails } = fixtures;

    const GCPClusterWithSecureBoot = {
      ...OSDGCPClusterDetails.cluster,
      cloud_provider: {
        id: 'gcp',
      },
      gcp: {
        security: {
          secure_boot: true,
        },
      },
    };
    it('Add machine pool inherits secure boot in case of GCP cluster', async () => {
      render(
        <EditMachinePoolModal
          cluster={GCPClusterWithSecureBoot as unknown as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machinePoolsResponse={gcpMachinePoolResponse}
        />,
      );

      expect(
        await screen.findByLabelText('Enable Secure Boot support for Shielded VMs'),
      ).toBeInTheDocument();
      const check = await screen.findByRole('checkbox', {
        name: /Shielded VM Enable Secure Boot support for Shielded VMs/i,
      });

      expect(check).toBeChecked();
      expect(check).not.toBeDisabled();
    });

    it('Edit machine pool GCP Secure boot inherited by the cluster', async () => {
      render(
        <EditMachinePoolModal
          cluster={GCPClusterWithSecureBoot as unknown as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machinePoolId="novm"
          machinePoolsResponse={gcpMachinePoolResponse}
        />,
      );

      expect(
        await screen.findByLabelText('Enable Secure Boot support for Shielded VMs'),
      ).toBeInTheDocument();
      const check = await screen.findByRole('checkbox', {
        name: /Shielded VM Enable Secure Boot support for Shielded VMs/i,
      });

      expect(check).toBeChecked();
      expect(check).toBeDisabled();
    });

    it('Disabled shieldedVm checkbox with tooltip', async () => {
      const { user } = render(
        <EditMachinePoolModal
          cluster={GCPClusterWithSecureBoot as unknown as ClusterFromSubscription}
          onClose={() => {}}
          {...commonProps}
          machinePoolId="novm"
          machinePoolsResponse={gcpMachinePoolResponse}
        />,
      );

      const hoverableText = await screen.findByLabelText(
        'Enable Secure Boot support for Shielded VMs',
      );

      await user.hover(hoverableText);

      expect(
        screen.getByText(
          'Secure Boot settings can only be modified during machine pool creation and are not editable afterward',
        ),
      );
    });
  });
});
