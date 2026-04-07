import * as React from 'react';
import { Formik } from 'formik';

import docLinks from '~/common/docLinks.mjs';
import { FieldId } from '~/components/clusters/wizards/common';
import { render, screen, waitFor } from '~/testUtils';

import { MachinePool } from './MachinePool';

describe('<MachinePool />', () => {
  it('should open nodes labels section by default if node labels are set', async () => {
    render(
      <Formik
        initialValues={{
          [FieldId.NodeLabels]: [{ key: 'test-key', value: 'test-value' }],
          [FieldId.MachineType]: 'test',
          [FieldId.MachineTypeForceChoice]: 'test',
          [FieldId.BillingModel]: 'marketplace-aws',
          [FieldId.Product]: 'ROSA',
          [FieldId.CloudProvider]: 'aws',
          [FieldId.ClusterVersion]: { raw_id: '4.17.1' },
        }}
        onSubmit={() => {}}
      >
        <MachinePool />
      </Formik>,
    );

    await waitFor(() => {
      const sectionToggle = screen.getByRole('button', { name: 'Add node labels' });
      expect(sectionToggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('should show autoscaling settings button for OSD CCS GCP', async () => {
    render(
      <Formik
        initialValues={{
          [FieldId.NodeLabels]: [{ key: 'test-key', value: 'test-value' }],
          [FieldId.MachineType]: 'test',
          [FieldId.MachineTypeForceChoice]: 'test',
          [FieldId.BillingModel]: 'marketplace-gcp',
          [FieldId.Product]: 'OSD',
          [FieldId.CloudProvider]: 'GCP',
          [FieldId.Byoc]: 'true',
          [FieldId.ClusterVersion]: { raw_id: '4.17.1' },
        }}
        onSubmit={() => {}}
      >
        <MachinePool />
      </Formik>,
    );
    await waitFor(() => {
      expect(screen.getByText('Edit cluster autoscaling settings')).toBeInTheDocument();
    });
  });

  it('renders correct autoscaling link for OSD cluster', async () => {
    const { user } = render(
      <Formik
        initialValues={{
          [FieldId.NodeLabels]: [{ key: 'test-key', value: 'test-value' }],
          [FieldId.MachineType]: 'test',
          [FieldId.MachineTypeForceChoice]: 'test',
          [FieldId.BillingModel]: 'marketplace-gcp',
          [FieldId.Product]: 'OSD',
          [FieldId.CloudProvider]: 'GCP',
          [FieldId.Byoc]: 'true',
          [FieldId.ClusterVersion]: { raw_id: '4.21.4' },
        }}
        onSubmit={() => {}}
      >
        <MachinePool />
      </Formik>,
    );

    const moreInfoBtn = await screen.findByRole('button', {
      name: 'More information about autoscaling',
    });
    await user.click(moreInfoBtn);

    const link = screen.getByText('Learn more about autoscaling');
    expect(link).toHaveAttribute('href', docLinks.OSD_CLUSTER_AUTOSCALING);
  });

  it('renders correct autoscaling link for rosa cluster', async () => {
    const { user } = render(
      <Formik
        initialValues={{
          [FieldId.NodeLabels]: [{ key: 'test-key', value: 'test-value' }],
          [FieldId.MachineType]: 'test',
          [FieldId.MachineTypeForceChoice]: 'test',
          [FieldId.BillingModel]: 'marketplace-aws',
          [FieldId.Product]: 'ROSA',
          [FieldId.CloudProvider]: 'aws',
          [FieldId.ClusterVersion]: { raw_id: '4.21.4' },
        }}
        onSubmit={() => {}}
      >
        <MachinePool />
      </Formik>,
    );

    const moreInfoBtn = await screen.findByRole('button', {
      name: 'More information about autoscaling',
    });
    await user.click(moreInfoBtn);

    const link = screen.getByText('Learn more about autoscaling with ROSA');
    expect(link).toHaveAttribute('href', docLinks.ROSA_AUTOSCALING);
  });
});
