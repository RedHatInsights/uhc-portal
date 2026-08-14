import React from 'react';
import { Formik } from 'formik';

import { FieldId as RosaFieldId } from '~/components/clusters/wizards/rosa/constants';
import { render, screen } from '~/testUtils';

import { AutoScaleEnabledInputs } from './AutoScaleEnabledInputs';

describe('AutoScaleEnabledInputs', () => {
  const initialValues = {
    [RosaFieldId.Hypershift]: 'true',
    [RosaFieldId.AutoscalingEnabled]: true,
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

      // Test for right amount - above minimum value and below max nodes
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '3');

      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(3);

      // Test for minimum more than maximum
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '10');

      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(10);
      expect(screen.getByText('Max nodes cannot be less than min nodes.')).toBeInTheDocument();
    });

    it('validates min nodes input correctly for more than 1 subnet isHypershift', async () => {
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
      expect(screen.queryByText('Input cannot be less than 1.')).not.toBeInTheDocument();
    });

    it('validates min nodes input correctly for more than 1 subnet !isHypershift', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'false',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
        }),
      );
      // Test for too few
      await user.clear(screen.getByLabelText('Minimum nodes'));
      await user.type(screen.getByLabelText('Minimum nodes'), '0');

      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(0);
      expect(screen.getByText('Input cannot be less than 2.')).toBeInTheDocument();
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
      expect(screen.getByText('Maximum nodes cannot be less than 2.')).toBeInTheDocument();

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

    it('sets minimum value when value is not set for 1 subnet isHypershift', async () => {
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

    it('sets minimum value when value is not set for 1 subnet !isHypershift', async () => {
      render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'false',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
          [RosaFieldId.MinReplicas]: '',
          [RosaFieldId.MaxReplicas]: '',
        }),
      );

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(2);
      expect(await screen.findByLabelText('Minimum nodes')).toHaveValue(2);
    });

    it('sets minimum value when value is not set for 2 subnets isHypershift', async () => {
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

    it('shows validation error when max nodes is manually set to 0 with 1 subnet', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
          [RosaFieldId.MinReplicas]: '0',
          [RosaFieldId.MaxReplicas]: '2',
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '0');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(0);
      expect(screen.getByText('Maximum nodes cannot be less than 2.')).toBeInTheDocument();
    });

    it('shows validation error when max nodes is manually set to 1 with 1 subnet', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
          [RosaFieldId.MinReplicas]: '0',
          [RosaFieldId.MaxReplicas]: '2',
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '1');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(1);
      expect(screen.getByText('Maximum nodes cannot be less than 2.')).toBeInTheDocument();
    });

    it('allows max nodes of 1 when there are multiple subnets', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
          [RosaFieldId.MinReplicas]: '0',
          [RosaFieldId.MaxReplicas]: '1',
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '1');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(1);
      expect(screen.queryByText(/Maximum nodes cannot be less than/)).not.toBeInTheDocument();
    });

    it('rejects max nodes above HCP ceiling with 1 pool and sufficient version', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
          [RosaFieldId.ClusterVersion]: { raw_id: '4.16.0' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '501');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(501);
      expect(screen.getByText('Input cannot be more than 500.')).toBeInTheDocument();
    });

    it('rejects max nodes above HCP ceiling divided by 2 pools', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
          [RosaFieldId.ClusterVersion]: { raw_id: '4.16.0' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '251');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(251);
      expect(screen.getByText('Input cannot be more than 250.')).toBeInTheDocument();
    });

    it('rejects max nodes above HCP ceiling divided by 3 pools (floors to 166)', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2', 'subnet3'],
          [RosaFieldId.ClusterVersion]: { raw_id: '4.16.0' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '167');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(167);
      expect(screen.getByText('Input cannot be more than 166.')).toBeInTheDocument();
    });

    it('rejects max nodes above HCP insufficient-version ceiling with 1 pool', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1'],
          [RosaFieldId.ClusterVersion]: { raw_id: '4.14.19' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '91');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(91);
      expect(screen.getByText('Input cannot be more than 90.')).toBeInTheDocument();
    });

    it('rejects max nodes above HCP insufficient-version ceiling divided by 2 pools (floors to 45)', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'true',
          [RosaFieldId.MachinePoolsSubnets]: ['subnet1', 'subnet2'],
          [RosaFieldId.ClusterVersion]: { raw_id: '4.14.19' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '46');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(46);
      expect(screen.getByText('Input cannot be more than 45.')).toBeInTheDocument();
    });
  });

  describe('not hypershift cluster', () => {
    it('falls back to the default max worker nodes when no cluster version is set', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'false',
          [RosaFieldId.MultiAz]: 'false',
          [RosaFieldId.ClusterVersion]: undefined,
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '181');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(181);
      expect(screen.getByText('Input cannot be more than 180.')).toBeInTheDocument();
    });

    it('rejects max nodes above Classic ceiling with sufficient version (249)', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'false',
          [RosaFieldId.MultiAz]: 'false',
          [RosaFieldId.ClusterVersion]: { raw_id: '4.14.14' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '250');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(250);
      expect(screen.getByText('Input cannot be more than 249.')).toBeInTheDocument();
    });

    it('rejects max nodes above Classic multi-AZ ceiling per zone with sufficient version (83)', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'false',
          [RosaFieldId.MultiAz]: 'true',
          [RosaFieldId.ClusterVersion]: { raw_id: '4.14.14' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '84');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(84);
      expect(screen.getByText('Input cannot be more than 83.')).toBeInTheDocument();
    });

    it('rejects max nodes above Classic multi-AZ ceiling per zone with insufficient version (60)', async () => {
      const { user } = render(
        buildTestComponent({
          [RosaFieldId.Hypershift]: 'false',
          [RosaFieldId.MultiAz]: 'true',
          [RosaFieldId.ClusterVersion]: { raw_id: '4.13.0' },
        }),
      );

      await user.clear(screen.getByLabelText('Maximum nodes'));
      await user.type(screen.getByLabelText('Maximum nodes'), '61');

      expect(await screen.findByLabelText('Maximum nodes')).toHaveValue(61);
      expect(screen.getByText('Input cannot be more than 60.')).toBeInTheDocument();
    });
  });
});
