import React from 'react';
import { Formik } from 'formik';

import { FieldId as RosaFieldId } from '~/components/clusters/wizards/rosa/constants';
import { render, screen } from '~/testUtils';

import { AutoScaleEnabledInputs } from './AutoScaleEnabledInputs';

describe('AutoScaleEnabledInputs', () => {
  const initialValues = {
    [RosaFieldId.Hypershift]: 'true',
    [RosaFieldId.AutoscalingEnabled]: 'true',
    [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
    [RosaFieldId.MultiAz]: 'false',
    [RosaFieldId.MinReplicas]: '2',
    [RosaFieldId.MaxReplicas]: '4',
    [RosaFieldId.Product]: 'ROSA',
    [RosaFieldId.Byoc]: 'false',
    [RosaFieldId.ClusterVersion]: { raw_id: '4.11' },
  };

  const buildTestComponent = (formValues = {}) => (
    <Formik
      initialValues={{
        ...initialValues,
        ...formValues,
      }}
      onSubmit={() => {}}
    >
      <AutoScaleEnabledInputs />
    </Formik>
  );

  describe('Hypershift (HCP)', () => {
    it('validates min nodes input correctly for 1 subnet', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
        }),
      );
      // Test for too few
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '0');

      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(0);
      expect(screen.getByText('Input cannot be less than 2.')).toBeInTheDocument();

      // Test for right amount - above minimum value and below max nodes
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '3');

      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(3);
      expect(screen.queryByText('Input cannot be less than 2.')).not.toBeInTheDocument();

      // Test for minimum more than maximum
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '10');

      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(10);
      expect(screen.getByText('Max nodes cannot be less than min nodes.')).toBeInTheDocument();
    });

    it('validates min nodes input correctly for more than 1 subnet', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
        }),
      );
      // Test for too few
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '0');

      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(0);
      expect(screen.getByText('Input cannot be less than 1.')).toBeInTheDocument();
    });

    it('validates max nodes input correctly', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
        }),
      );
      // Test for too few - minimum more than maximum
      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '0');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(0);
      expect(screen.getByText('Input cannot be less than 2.')).toBeInTheDocument();

      // Test for right amount - above minimum value
      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '3');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(3);
      expect(screen.queryByText('Input cannot be less than 2.')).not.toBeInTheDocument();
    });

    it('validates when max nodes is less than min nodes', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '4');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(4);

      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '6');
      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(6);

      expect(screen.getByText('Max nodes cannot be less than min nodes.')).toBeInTheDocument();
    });

    it('sets minimum value when value is not set for 1 subnet', async () => {
      render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
          [RosaFieldId.MinReplicas]: '',
          [RosaFieldId.MaxReplicas]: '',
        }),
      );

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(2);
      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(2);
    });

    it('sets minimum value when value is not set for 1 subnet', async () => {
      render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
          [RosaFieldId.MinReplicas]: '',
          [RosaFieldId.MaxReplicas]: '',
        }),
      );

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(1);
      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(1);
    });

    it('shows max warning when user changes subnets', async () => {
      const fieldValues = {
        [RosaFieldId.Hypershift]: 'true',
        [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
        [RosaFieldId.MinReplicas]: '1',
        [RosaFieldId.MaxReplicas]: '1',
      };
      const { rerender, user } = render(buildTestComponent(fieldValues));
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '2');
      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(2);

      expect(screen.getByText('Max nodes cannot be less than min nodes.')).toBeInTheDocument();

      rerender(
        buildTestComponent({
          ...fieldValues,
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet99'],
        }),
      );
      expect(screen.getByText('Max nodes cannot be less than min nodes.')).toBeInTheDocument();
    });
  });
});
