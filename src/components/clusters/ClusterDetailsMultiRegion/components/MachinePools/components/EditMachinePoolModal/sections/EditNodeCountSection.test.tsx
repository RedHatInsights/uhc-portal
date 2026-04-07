import React from 'react';
import { Formik } from 'formik';

import { screen } from '@testing-library/react';

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
  });
});
