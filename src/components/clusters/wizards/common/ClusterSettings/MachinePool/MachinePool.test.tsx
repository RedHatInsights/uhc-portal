import * as React from 'react';
import { Formik } from 'formik';

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
});
