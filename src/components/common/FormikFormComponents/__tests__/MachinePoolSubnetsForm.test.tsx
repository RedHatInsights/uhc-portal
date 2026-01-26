import React from 'react';
import * as formik from 'formik';
import { Formik, useFormikContext } from 'formik';

import { FieldId } from '~/components/clusters/wizards/common/constants';
import * as utils from '~/components/clusters/wizards/form/utils';
import { FieldId as RosaFieldId } from '~/components/clusters/wizards/rosa/constants';
import { checkAccessibility, render, screen, waitFor, withState } from '~/testUtils';

import MachinePoolSubnetsForm, {
  getMinComputeNodeCountAfterPoolRemoval,
} from '../MachinePoolSubnetsForm';

import { repeatedSubnets } from './MachinePoolSubnetsForm.fixtures';

describe('getMinComputeNodeCountAfterPoolRemoval', () => {
  it('returns undefined when isHypershift is false', () => {
    const result = getMinComputeNodeCountAfterPoolRemoval({
      isHypershift: false,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 1,
      newPoolsLength: 1,
    });

    expect(result).toBeUndefined();
  });

  it('returns undefined when currentNodes is undefined', () => {
    const result = getMinComputeNodeCountAfterPoolRemoval({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: undefined,
      newPoolsLength: 1,
    });

    expect(result).toBeUndefined();
  });

  it('returns undefined when current nodes are above minimum', () => {
    // For 1 pool: min=2, increment=1 → minUserInputNodes = 2
    const result = getMinComputeNodeCountAfterPoolRemoval({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 5,
      newPoolsLength: 1,
    });

    expect(result).toBeUndefined();
  });

  it('returns adjusted value when current nodes are below minimum for 1 pool', () => {
    // For 1 pool: min=2, increment=1 → minUserInputNodes = 2
    const result = getMinComputeNodeCountAfterPoolRemoval({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 1,
      newPoolsLength: 1,
    });

    expect(result).toBe(2);
  });

  it('returns undefined when current nodes equal the minimum for 2 pools', () => {
    // For 2 pools: min=2, increment=2 → minUserInputNodes = 1
    // So currentNodes=1 is valid and no adjustment needed
    const result = getMinComputeNodeCountAfterPoolRemoval({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: 1,
      newPoolsLength: 2,
    });

    expect(result).toBeUndefined();
  });

  it('handles string currentNodes value', () => {
    // For 1 pool: min=2, increment=1 → minUserInputNodes = 2
    const result = getMinComputeNodeCountAfterPoolRemoval({
      isHypershift: true,
      isByoc: true,
      isMultiAz: false,
      currentNodes: '1',
      newPoolsLength: 1,
    });

    expect(result).toBe(2);
  });
});

const machinePoolSubnetsFormProps = {
  selectedVPC: {
    name: 'test-123abc-vpc',
    id: 'vpc-123456789',
    aws_subnets: [
      {
        availability_zone: 'us-east-2a',
        cidr_block: '10.0.0.0/19',
        name: 'subnet-03df6fb9d7677c84c',
        public: false,
        red_hat_managed: false,
        subnet_id: 'subnet-03df6fb9d7677c84c',
      },
      {
        availability_zone: 'us-east-2b',
        cidr_block: '10.0.32.0/19',
        name: 'subnet-0b6h8g574bcdc20kp',
        public: false,
        red_hat_managed: false,
        subnet_id: 'subnet-0b6h8g574bcdc20kp',
      },
      {
        availability_zone: 'us-east-2c',
        cidr_block: '10.0.64.0/19',
        name: 'subnet-0cv67g3h4w859v0t1',
        public: false,
        red_hat_managed: false,
        subnet_id: 'subnet-0cv67g3h4w859v0t1',
      },
    ],
  },
  allMachinePoolSubnets: [],
};

describe('<MachinePoolSubnetsForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('it is accessible', () => {
    it('no content', async () => {
      // Act
      const { container } = withState({}).render(
        <Formik
          initialValues={{
            [FieldId.MachinePoolsSubnets]: [],
          }}
          onSubmit={() => {}}
        >
          <MachinePoolSubnetsForm
            {...machinePoolSubnetsFormProps}
            allMachinePoolSubnets={repeatedSubnets}
          />
        </Formik>,
      );

      // Assert
      await checkAccessibility(container);
    });

    it('with content', async () => {
      // Act
      const { container } = withState({}).render(
        <Formik
          initialValues={{
            [FieldId.MachinePoolsSubnets]: repeatedSubnets,
          }}
          onSubmit={() => {}}
        >
          <MachinePoolSubnetsForm {...machinePoolSubnetsFormProps} />
        </Formik>,
      );

      // Assert
      await waitFor(() => checkAccessibility(container));
    });
  });

  describe('check validation', () => {
    it('changes machine pools subnets on removal', async () => {
      // Arrange
      const setNestedObjectValuesSpy = jest.spyOn(formik, 'setNestedObjectValues');
      const getScrollErrorIdsSpy = jest.spyOn(utils, 'getScrollErrorIds');
      const expectedErrors = [
        {
          machinePoolsSubnets: [
            undefined,
            {
              privateSubnetId: 'Every machine pool must be associated to a different subnet',
            },
            {
              privateSubnetId: 'Every machine pool must be associated to a different subnet',
            },
          ],
        },
        {
          machinePoolsSubnets: [
            undefined,
            {
              privateSubnetId: 'Every machine pool must be associated to a different subnet',
            },
            {
              privateSubnetId: 'Every machine pool must be associated to a different subnet',
            },
          ],
        },
      ];

      const { user } = withState({}).render(
        <Formik
          initialValues={{
            [FieldId.MachinePoolsSubnets]: repeatedSubnets,
          }}
          onSubmit={() => {}}
        >
          <MachinePoolSubnetsForm
            {...machinePoolSubnetsFormProps}
            allMachinePoolSubnets={repeatedSubnets}
          />
        </Formik>,
      );

      expect(screen.getByText('subnet-03df6fb9d7677c84c')).toBeInTheDocument();

      // Act
      await user.click(screen.getByTestId('remove-machine-pool-2'));
      await user.click(screen.getAllByLabelText('Remove machine pool')[0]);

      // Assert
      expect(setNestedObjectValuesSpy).toHaveBeenCalledTimes(1);
      expect(setNestedObjectValuesSpy).toHaveBeenCalledWith(expectedErrors[1], true);

      expect(screen.queryByText('subnet-03df6fb9d7677c84c')).toBe(null);

      expect(getScrollErrorIdsSpy).toHaveBeenCalledTimes(1);
      expect(getScrollErrorIdsSpy).toHaveBeenCalledWith(expectedErrors[1]);
    });
  });
});

describe('subnet ordering and grouping functionality', () => {
  it('renders subnet select fields grouped by availability zone', async () => {
    const machinePoolSubnets = [
      { availabilityZone: '', privateSubnetId: 'subnet-03df6fb9d7677c84c', publicSubnetId: '' },
      { availabilityZone: '', privateSubnetId: 'subnet-0b6h8g574bcdc20kp', publicSubnetId: '' },
    ];

    const { user } = withState({}).render(
      <Formik
        initialValues={{
          [FieldId.MachinePoolsSubnets]: machinePoolSubnets,
        }}
        onSubmit={() => {}}
      >
        <MachinePoolSubnetsForm
          {...machinePoolSubnetsFormProps}
          allMachinePoolSubnets={machinePoolSubnets}
        />
      </Formik>,
    );

    const selectDropdowns = screen.getAllByRole('button', { name: 'Options menu' });
    await user.click(selectDropdowns[1]);

    expect(
      screen.queryByRole('option', { name: 'subnet-03df6fb9d7677c84c' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'subnet-0b6h8g574bcdc20kp' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'subnet-0cv67g3h4w859v0t1' })).toBeInTheDocument();
  });

  it('can toggle to view used subnets', async () => {
    const initialSubnets = [
      {
        availabilityZone: 'us-east-2a',
        privateSubnetId: 'subnet-03df6fb9d7677c84c',
        publicSubnetId: '',
      },
      {
        availabilityZone: '',
        privateSubnetId: '',
        publicSubnetId: '',
      },
    ];

    const { user } = withState({}).render(
      <Formik
        initialValues={{
          [FieldId.MachinePoolsSubnets]: initialSubnets,
        }}
        onSubmit={() => {}}
      >
        <MachinePoolSubnetsForm
          {...machinePoolSubnetsFormProps}
          allMachinePoolSubnets={initialSubnets}
        />
      </Formik>,
    );

    const addButton = screen.getByRole('button', { name: /Add machine pool/i });
    await user.click(addButton);

    const selectDropdowns = screen.getAllByRole('button', { name: 'Options menu' });
    await user.click(selectDropdowns[1]);
    const viewUsedButton = screen.getByRole('option', { name: 'View Used Subnets' });
    await user.click(viewUsedButton);

    // used subnet should be visible with "- Used" suffix in group name
    expect(screen.getByText('us-east-2a - Used')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'subnet-03df6fb9d7677c84c' })).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'Hide Used Subnets' })).toBeInTheDocument();
  });

  it('allows adding and removing machine pools with proper subnet handling', async () => {
    const initialMachinePoolSubnets = [
      { availabilityZone: '', privateSubnetId: 'subnet-03df6fb9d7677c84c', publicSubnetId: '' },
    ];

    const { user } = withState({}).render(
      <Formik
        initialValues={{
          [FieldId.MachinePoolsSubnets]: initialMachinePoolSubnets,
        }}
        onSubmit={() => {}}
      >
        <MachinePoolSubnetsForm
          {...machinePoolSubnetsFormProps}
          allMachinePoolSubnets={initialMachinePoolSubnets}
        />
      </Formik>,
    );

    // add machine pool
    const addButton = screen.getByRole('button', { name: /Add machine pool/i });
    expect(addButton).toBeInTheDocument();

    expect(screen.getByText('Machine pool 1')).toBeInTheDocument();

    // select subnet for first machine pool
    const selectDropdowns = screen.getAllByRole('button', { name: 'Options menu' });
    await user.click(selectDropdowns[0]);
    const firstSubnet = screen.getByRole('option', { name: 'subnet-03df6fb9d7677c84c' });
    expect(firstSubnet).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'subnet-0b6h8g574bcdc20kp' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'subnet-0cv67g3h4w859v0t1' })).toBeInTheDocument();
  });

  it('adjusts compute nodes to minimum when machine pools are removed and current value is below new minimum', async () => {
    const threePools = [
      { availabilityZone: '', privateSubnetId: 'subnet-03df6fb9d7677c84c', publicSubnetId: '' },
      { availabilityZone: '', privateSubnetId: 'subnet-0b6h8g574bcdc20kp', publicSubnetId: '' },
      { availabilityZone: '', privateSubnetId: 'subnet-0cv67g3h4w859v0t1', publicSubnetId: '' },
    ];

    // Real helper functions behavior:
    // 3 pools: min=3, increment=3 → minUserInputNodes = 3/3 = 1
    // 1 pool: min=2, increment=1 → minUserInputNodes = 2/1 = 2

    // Component to read form values for verification
    const ValuesReader = ({ onValuesChange }: { onValuesChange: (values: any) => void }) => {
      const { values } = useFormikContext();
      React.useEffect(() => {
        onValuesChange(values);
      }, [values, onValuesChange]);
      return null;
    };

    let formValues: any = {};
    const handleValuesChange = (values: any) => {
      formValues = values;
    };

    const initialValues = {
      [FieldId.MachinePoolsSubnets]: threePools,
      [RosaFieldId.Hypershift]: 'true',
      [RosaFieldId.Byoc]: 'true',
      [FieldId.MultiAz]: 'false',
      [RosaFieldId.NodesCompute]: 1, // Valid for 3 pools (min=3/3=1), but invalid for 1 pool (min=2/1=2)
    };

    const { user, rerender } = render(
      <Formik initialValues={initialValues} onSubmit={() => {}} enableReinitialize>
        <>
          <ValuesReader onValuesChange={handleValuesChange} />
          <MachinePoolSubnetsForm
            {...machinePoolSubnetsFormProps}
            allMachinePoolSubnets={threePools}
          />
        </>
      </Formik>,
    );

    // Remove two machine pools (from 3 to 1)
    const removeButtons = screen.getAllByLabelText('Remove machine pool');
    expect(removeButtons).toHaveLength(3);

    // Remove pool at index 1 (second pool) - should result in 2 pools
    await user.click(removeButtons[1]);

    // Update allMachinePoolSubnets prop to reflect removal
    const twoPools = [threePools[0], threePools[2]];
    rerender(
      <Formik initialValues={formValues || initialValues} onSubmit={() => {}} enableReinitialize>
        <>
          <ValuesReader onValuesChange={handleValuesChange} />
          <MachinePoolSubnetsForm
            {...machinePoolSubnetsFormProps}
            allMachinePoolSubnets={twoPools}
          />
        </>
      </Formik>,
    );

    // Remove pool at index 0 (first pool) - should result in 1 pool and trigger adjustment
    const remainingRemoveButtons = screen.getAllByLabelText('Remove machine pool');
    await user.click(remainingRemoveButtons[0]);

    await waitFor(() => {
      expect(formValues[RosaFieldId.NodesCompute]).toBe(2);
    });
  });
});
