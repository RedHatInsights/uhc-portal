import React from 'react';
import { Formik } from 'formik';

import { screen, within } from '@testing-library/react';

import docLinks from '~/common/docLinks.mjs';
import * as utils from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/components/EditMachinePoolModal/components/utils';
import { withState } from '~/testUtils';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import EditNodeCountSection from './EditNodeCountSection';

const defaultMachinePool: MachinePool = {
  id: 'foo',
  replicas: 30,
  availability_zones: ['us-east-1a'],
  instance_type: 'm5.xlarge',
} as MachinePool;

const initialState = {
  userProfile: {
    organization: {
      pending: false,
      fulfilled: true,
      quotaList: { items: [] },
    },
  },
  clusterAutoscaler: {
    hasAutoscaler: false,
  },
};

const nonHCPCluster: ClusterFromSubscription = {
  product: { id: 'OSD' },
  subscription: {
    cluster_billing_model: SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp,
    capabilities: [{}],
    managed: false,
  },
  cloud_provider: { id: 'aws' },
  hypershift: { enabled: false },
} as ClusterFromSubscription;

const hcpCluster: ClusterFromSubscription = {
  product: { id: 'ROSA' },
  cloud_provider: { id: 'aws' },
  hypershift: { enabled: true },
} as ClusterFromSubscription;

describe('<EditNodeCountSection />', () => {
  describe('Resizing alert', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(utils, 'masterResizeAlertThreshold').mockReturnValue(1);
    });

    it('shows ResizingAlert for non HCP clusters', () => {
      withState(initialState).render(
        <Formik
          initialValues={{ replicas: 30, instanceType: 'm5.xlarge', autoscaling: false }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={nonHCPCluster}
            machinePool={defaultMachinePool}
          />
        </Formik>,
      );

      expect(
        screen.getByText(/Node scaling is automatic and will be performed immediately/i),
      ).toBeInTheDocument();
    });

    it('hides ResizingAlert for HCP clusters', () => {
      withState(initialState).render(
        <Formik
          initialValues={{ replicas: 30, instanceType: 'm5.xlarge', autoscaling: false }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={defaultMachinePool}
          />
        </Formik>,
      );

      expect(
        screen.queryByText(/Node scaling is automatic and will be performed immediately/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('autoscaling', () => {
    it('renders correct autoscaling link for rosa cluster', async () => {
      const { user } = withState(initialState).render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <EditNodeCountSection
            machinePools={[]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={defaultMachinePool}
          />
        </Formik>,
      );

      const moreInfoBtn = await screen.findByRole('button', {
        name: 'More information about autoscaling',
      });
      await user.click(moreInfoBtn);

      const link = screen.getByText('Learn more about autoscaling with ROSA');
      expect(link).toHaveAttribute('href', docLinks.ROSA_AUTOSCALING);
    });

    it('renders correct autoscaling link for OSD cluster', async () => {
      const { user } = withState(initialState).render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <EditNodeCountSection
            machinePools={[]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={nonHCPCluster}
            machinePool={defaultMachinePool}
          />
        </Formik>,
      );

      const moreInfoBtn = await screen.findByRole('button', {
        name: 'More information about autoscaling',
      });
      await user.click(moreInfoBtn);

      const link = screen.getByText('Learn more about autoscaling');
      expect(link).toHaveAttribute('href', docLinks.OSD_CLUSTER_AUTOSCALING);
    });

    it('does not allow 0 max replicas for classic (non-HCP) cluster', async () => {
      withState(initialState).render(
        <Formik
          initialValues={{
            autoscaling: true,
            autoscaleMin: 1,
            autoscaleMax: 1,
            instanceType: { id: 'm5.xlarge' },
          }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={nonHCPCluster}
            machinePool={defaultMachinePool}
          />
        </Formik>,
      );

      const autoScaleMaxNodesFormGroup = screen.getByTestId('autoscale-max-group');
      const autoscaleMaxNodesInput = within(autoScaleMaxNodesFormGroup).getByRole(
        'spinbutton',
      ) as HTMLInputElement;
      expect(autoscaleMaxNodesInput.value).toBe('1');

      const autoscaleMaxNodesMinusButton = within(autoScaleMaxNodesFormGroup).getByRole('button', {
        name: 'Minus',
      });
      expect(autoscaleMaxNodesMinusButton).toBeDisabled();
    });

    it('does not allow 0 max replicas for HCP cluster', async () => {
      const { user } = withState(initialState).render(
        <Formik
          initialValues={{
            autoscaling: true,
            autoscaleMin: 0,
            autoscaleMax: 1,
            instanceType: { id: 'm5.xlarge' },
          }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[defaultMachinePool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={{}}
          />
        </Formik>,
      );

      const autoScaleMaxNodesFormGroup = screen.getByTestId('autoscale-max-group');
      const autoscaleMaxNodesInput = within(autoScaleMaxNodesFormGroup).getByRole(
        'spinbutton',
      ) as HTMLInputElement;
      expect(autoscaleMaxNodesInput.value).toBe('1');

      const autoscaleMaxNodesMinusButton = within(autoScaleMaxNodesFormGroup).getByRole('button', {
        name: 'Minus',
      });
      expect(autoscaleMaxNodesMinusButton).toBeDisabled();

      await user.click(autoscaleMaxNodesMinusButton);
      expect(autoscaleMaxNodesInput.value).toBe('1');
    });
  });

  describe('HCP autoscaling min replicas', () => {
    it('allows 0 min replicas for HCP cluster when other pools cover capacity', async () => {
      const currentPool = {
        id: 'current-pool',
        autoscaling: { min_replicas: 1, max_replicas: 1 },
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const otherPool = {
        id: 'other-pool',
        autoscaling: { min_replicas: 1, max_replicas: 1 },
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const { user } = withState(initialState).render(
        <Formik
          initialValues={{
            autoscaling: true,
            autoscaleMin: 1,
            autoscaleMax: 1,
            instanceType: { id: 'm5.xlarge' },
          }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[currentPool, otherPool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={currentPool}
          />
        </Formik>,
      );

      const autoScaleMinFormGroup = screen.getByTestId('autoscale-min-group');
      const minInput = within(autoScaleMinFormGroup).getByRole('spinbutton') as HTMLInputElement;
      const minusButton = within(autoScaleMinFormGroup).getByRole('button', { name: 'Minus' });

      expect(minInput.value).toBe('1');
      expect(minusButton).not.toBeDisabled();

      await user.click(minusButton);
      expect(minInput.value).toBe('0');
    });

    it('does not allow negative min replicas for HCP cluster', async () => {
      const currentPool = {
        id: 'current-pool',
        autoscaling: { min_replicas: 0, max_replicas: 2 },
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      withState(initialState).render(
        <Formik
          initialValues={{
            autoscaling: true,
            autoscaleMin: 0,
            autoscaleMax: 2,
            instanceType: { id: 'm5.xlarge' },
          }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[currentPool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={currentPool}
          />
        </Formik>,
      );

      const autoScaleMinFormGroup = screen.getByTestId('autoscale-min-group');
      const minInput = within(autoScaleMinFormGroup).getByRole('spinbutton') as HTMLInputElement;
      const minusButton = within(autoScaleMinFormGroup).getByRole('button', { name: 'Minus' });

      expect(minInput.value).toBe('0');
      expect(minusButton).toBeDisabled();
    });

    it('enforces minNodes on autoscale-min for non-HCP enforced default pool', () => {
      const ccsCluster = {
        ...nonHCPCluster,
        ccs: { enabled: true },
      } as ClusterFromSubscription;

      const enforcedDefaultPool = {
        id: 'worker',
        replicas: 2,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      } as MachinePool;

      withState(initialState).render(
        <Formik
          initialValues={{
            autoscaling: true,
            autoscaleMin: 2,
            autoscaleMax: 5,
            instanceType: { id: 'm5.xlarge' },
          }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[enforcedDefaultPool]}
            machineTypes={{
              types: { aws: [{ id: 'm5.xlarge', cpu: { value: 4 }, memory: { value: 16 } }] },
            }}
            allow249NodesOSDCCSROSA={false}
            cluster={ccsCluster}
            machinePool={enforcedDefaultPool}
          />
        </Formik>,
      );

      const autoScaleMinFormGroup = screen.getByTestId('autoscale-min-group');
      const minInput = within(autoScaleMinFormGroup).getByRole('spinbutton') as HTMLInputElement;
      const minusButton = within(autoScaleMinFormGroup).getByRole('button', { name: 'Minus' });

      expect(minInput.value).toBe('2');
      expect(minusButton).toBeDisabled();
    });
  });

  describe('HCP cluster minimum node requirements', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('allows 0 minimum nodes for tainted machine pool in HCP cluster', async () => {
      const taintedMachinePool = {
        id: 'tainted-pool',
        replicas: 1,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
        taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
      };

      const otherPool = {
        id: 'other-pool',
        replicas: 2,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const { user } = withState(initialState).render(
        <Formik
          initialValues={{ replicas: 1, instanceType: 'm5.xlarge', autoscaling: false }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[otherPool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={taintedMachinePool}
          />
        </Formik>,
      );

      const nodeCountInput = screen.getByLabelText('Compute nodes') as HTMLInputElement;
      const minusButton = screen.getByLabelText('Decrement compute nodes');

      await user.click(minusButton);
      expect(nodeCountInput.value).toBe('0');
    });

    it('allows 0 minimum nodes for untainted pool when other pools have 2+ untainted nodes in HCP cluster', async () => {
      const currentPool = {
        id: 'current-pool',
        replicas: 1,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const otherPool = {
        id: 'other-pool',
        replicas: 3,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const { user } = withState(initialState).render(
        <Formik
          initialValues={{ replicas: 1, instanceType: 'm5.xlarge', autoscaling: false }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[otherPool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={currentPool}
          />
        </Formik>,
      );

      const nodeCountInput = screen.getByLabelText('Compute nodes') as HTMLInputElement;
      const minusButton = screen.getByLabelText('Decrement compute nodes');

      await user.click(minusButton);
      expect(nodeCountInput.value).toBe('0');
    });

    it('requires 1 minimum node for untainted pool when other pools have 1 untainted node in HCP cluster', async () => {
      const currentPool = {
        id: 'current-pool',
        replicas: 2,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const otherPool = {
        id: 'other-pool',
        replicas: 1,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const { user } = withState(initialState).render(
        <Formik
          initialValues={{ replicas: 2, instanceType: 'm5.xlarge', autoscaling: false }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[otherPool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={currentPool}
          />
        </Formik>,
      );

      const nodeCountInput = screen.getByLabelText('Compute nodes') as HTMLInputElement;
      const minusButton = screen.getByLabelText('Decrement compute nodes');

      // Decrement once: 2 -> 1 (should work)
      await user.click(minusButton);
      expect(nodeCountInput.value).toBe('1');
      expect(minusButton).toBeDisabled();
    });

    it('requires 2 minimum nodes for untainted pool when other pools have 0 untainted nodes in HCP cluster', async () => {
      const currentPool = {
        id: 'current-pool',
        replicas: 3,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      const taintedPool = {
        id: 'tainted-pool',
        replicas: 3,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
        taints: [{ key: 'test', value: 'true', effect: 'NoSchedule' }],
      };

      const { user } = withState(initialState).render(
        <Formik
          initialValues={{ replicas: 3, instanceType: 'm5.xlarge', autoscaling: false }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[taintedPool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={currentPool}
          />
        </Formik>,
      );

      const nodeCountInput = screen.getByLabelText('Compute nodes') as HTMLInputElement;
      const minusButton = screen.getByLabelText('Decrement compute nodes');

      // Decrement once: 3 -> 2 (should work)
      await user.click(minusButton);
      expect(nodeCountInput.value).toBe('2');
      expect(minusButton).toBeDisabled();
    });

    it('requires 2 minimum nodes for untainted pool when no other pools exist in HCP cluster', async () => {
      const currentPool = {
        id: 'current-pool',
        replicas: 2,
        availability_zones: ['us-east-1a'],
        instance_type: 'm5.xlarge',
      };

      withState(initialState).render(
        <Formik
          initialValues={{ replicas: 2, instanceType: 'm5.xlarge', autoscaling: false }}
          onSubmit={() => {}}
        >
          <EditNodeCountSection
            machinePools={[currentPool]}
            machineTypes={{}}
            allow249NodesOSDCCSROSA={false}
            cluster={hcpCluster}
            machinePool={currentPool}
          />
        </Formik>,
      );

      const nodeCountInput = screen.getByLabelText('Compute nodes') as HTMLInputElement;
      const minusButton = screen.getByLabelText('Decrement compute nodes');

      // Should not be able to decrement below 2
      expect(nodeCountInput.value).toBe('2');
      expect(minusButton).toBeDisabled();
    });
  });
});
