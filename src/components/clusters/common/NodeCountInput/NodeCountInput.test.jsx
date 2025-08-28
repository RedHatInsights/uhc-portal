import React from 'react';

import { getMinNodesRequired } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import { checkAccessibility, render, screen } from '~/testUtils';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { normalizedProducts } from '../../../../common/subscriptionTypes';
import { MAX_NODES_HCP } from '../machinePools/constants';
import * as quotaSelectors from '../quotaSelectors';

import NodeCountInput from './NodeCountInput';

const MAX_NODES = 180; // mock data

const includedNodes = ({ isByoc, isMultiAz, isMachinePool }) => {
  if (isByoc || isMachinePool) {
    return 0;
  }
  return isMultiAz ? 9 : 4;
};

const baseProps = ({ isByoc, isMultiAz }) => ({
  isDisabled: false,
  label: 'compute nodes',
  currentNodeCount: 4,
  quota: {},
  machineTypes: {
    typesByID: {
      fake: { id: 'fake', generic_name: 'fake' },
    },
  },
  input: {
    name: 'compute-nodes',
    onChange: jest.fn(),
    onBlur: jest.fn(),
  },
  cloudProviderID: 'aws',
  product: normalizedProducts.OSD,
  billingModel: SubscriptionCommonFieldsClusterBillingModel.standard,

  minNodes: getMinNodesRequired(false, undefined, {
    isDefaultMachinePool: true,
    isByoc,
    isMultiAz,
  }),
});

describe('<NodeCountInput>', () => {
  let mockAvailableNodes;
  beforeEach(() => {
    mockAvailableNodes = jest.spyOn(quotaSelectors, 'availableQuota');
  });
  afterEach(() => {
    mockAvailableNodes.mockRestore();
  });

  describe('Single AZ', () => {
    it('is accessible', async () => {
      mockAvailableNodes.mockReturnValueOnce(10);
      const { container } = render(
        <NodeCountInput {...baseProps({ isByoc: false, isMultiAz: false })} />,
      );
      await checkAccessibility(container);
    });

    it('displays select as enabled with one option when no quota', () => {
      // Arrange
      mockAvailableNodes.mockReturnValueOnce(0);
      const minNodes = getMinNodesRequired(false, undefined, { isDefaultMachinePool: true });
      expect(minNodes).toEqual(4); // validate min value
      render(<NodeCountInput {...baseProps({ isByoc: false, isMultiAz: false })} />);

      // Assert
      expect(screen.getByRole('combobox')).not.toBeDisabled();
      expect(screen.getByRole('option')).toHaveValue(`${minNodes}`); // only show min value
      expect(screen.getByRole('option')).toHaveAccessibleName(`${minNodes}`);
    });

    it('displays select as enabled with expect number of options with some quota', () => {
      // Arrange
      mockAvailableNodes.mockReturnValueOnce(10);
      const minNodes = getMinNodesRequired(false, undefined, { isDefaultMachinePool: true }); // expected to be 4
      expect(minNodes).toEqual(4); // validate min value
      const expectedValues = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

      render(
        <NodeCountInput {...baseProps({ isByoc: false, isMultiAz: false })} machineType="fake" />,
      );

      // Assert
      const allOptions = screen.getAllByRole('option');
      expect(screen.getByRole('combobox')).not.toBeDisabled();
      expect(allOptions).toHaveLength(expectedValues.length);

      allOptions.forEach((option, index) => {
        expect(option).toHaveValue(`${expectedValues[index]}`);
        expect(option).toHaveAccessibleName(`${expectedValues[index]}`);
      });
    });

    it('displays select as enabled with last option value of MAX_NODES with extremely high quota', () => {
      // Arrange
      mockAvailableNodes.mockReturnValueOnce(10000);
      const minNodes = getMinNodesRequired(false, undefined, { isDefaultMachinePool: true }); // expected to be 4
      expect(MAX_NODES).toBeLessThan(10000); /// verify MAX_NODES is less than value sent
      render(
        <NodeCountInput {...baseProps({ isByoc: false, isMultiAz: false })} machineType="fake" />,
      );

      // Assert
      const allOptions = screen.getAllByRole('option');
      expect(screen.getByRole('combobox')).not.toBeDisabled();
      expect(allOptions).toHaveLength(MAX_NODES - minNodes + 1);

      // Verify first and last value
      expect(allOptions[0]).toHaveValue(`${minNodes}`);
      expect(allOptions[0]).toHaveAccessibleName(`${minNodes}`);
      expect(allOptions[allOptions.length - 1]).toHaveValue(`${MAX_NODES}`);
      expect(allOptions[allOptions.length - 1]).toHaveAccessibleName(`${MAX_NODES}`);
    });

    it('Changes select to default value when machineType is set to a type if no quota', async () => {
      // Arrange
      mockAvailableNodes.mockReturnValueOnce(10);
      const minNodes = getMinNodesRequired(false, undefined, { isDefaultMachinePool: true }); // expected to be 4
      expect(minNodes).toEqual(4); // validate min value
      const onChange = jest.fn();
      const newProps = { ...baseProps({ isByoc: false, isMultiAz: false }) };
      const inputProps = { ...newProps.input, onChange, value: 10 }; // note initial value is 10
      render(<NodeCountInput {...newProps} input={inputProps} machineType="fake2" />);

      // Assert
      expect(screen.getByRole('combobox')).toHaveValue(`${minNodes}`);
      expect(onChange).toBeCalledWith(minNodes);
    });

    describe('BYOC', () => {
      it('displays select as disabled  when insufficient quota', () => {
        // Arrange
        mockAvailableNodes.mockReturnValueOnce(0);
        render(<NodeCountInput {...baseProps({ isByoc: true })} isByoc machineType="" />);

        // Assert
        expect(screen.getByRole('combobox')).toBeDisabled();
      });

      describe('and is editing cluster', () => {
        it('displays select as enabled expected number of options when no quota', () => {
          // Arrange
          mockAvailableNodes.mockReturnValueOnce(0);
          const minNodes = getMinNodesRequired(false, undefined, {
            isDefaultMachinePool: true,
            isByoc: true,
          });
          expect(minNodes).toEqual(2);
          const { currentNodeCount } = baseProps({ isByoc: true });
          const expectedValues = [2, 3, 4];
          expect(expectedValues[expectedValues.length - 1]).toEqual(currentNodeCount);
          render(
            <NodeCountInput
              {...baseProps({ isByoc: true })}
              isByoc
              machineType="fake"
              isEditingCluster
            />,
          );

          // Assert
          expect(screen.getByRole('combobox')).not.toBeDisabled();
          const AllOptions = screen.getAllByRole('option');
          expect(AllOptions).toHaveLength(expectedValues.length);

          AllOptions.forEach((option, index) => {
            expect(option).toHaveValue(`${expectedValues[index]}`);
            expect(option).toHaveAccessibleName(`${expectedValues[index]}`);
          });
        });
      });

      describe('and is editing a machine pool', () => {
        it('displays select with one option when no quota', () => {
          // Arrange
          mockAvailableNodes.mockReturnValueOnce(0);
          const minNodes = getMinNodesRequired(false, undefined, {
            isDefaultMachinePool: true,
            isByoc: true,
          });
          expect(minNodes).toEqual(2);

          render(
            <NodeCountInput
              {...baseProps({ isByoc: true })}
              isByoc
              machineType="fake"
              isMachinePool
            />,
          );

          // Assert
          expect(screen.getByRole('combobox')).not.toBeDisabled();
          expect(screen.getByRole('option')).toHaveValue(`${minNodes}`); // only show min value
          expect(screen.getByRole('option')).toHaveAccessibleName(`${minNodes}`);
        });
      });
    });
  });

  describe('Multi AZ', () => {
    it('displays select as enabled with one option when no quota', () => {
      // Arrange
      mockAvailableNodes.mockReturnValueOnce(0);
      const minNodes = getMinNodesRequired(false, undefined, {
        isDefaultMachinePool: true,
        isMultiAz: true,
      });
      expect(minNodes).toEqual(9);
      render(
        <NodeCountInput
          {...baseProps({ isDefaultMachinePool: true, isMultiAz: true })}
          isMultiAz
        />,
      );

      // Assert
      expect(screen.getByRole('combobox')).not.toBeDisabled();
      expect(screen.getByRole('option')).toHaveValue(`${minNodes}`); // only show min value
      expect(screen.getByRole('option')).toHaveAccessibleName(`${minNodes / 3}`);
    });

    it('displays select as enabled known number options when some quota', () => {
      // Arrange
      mockAvailableNodes.mockReturnValueOnce(18);
      const minNodes = getMinNodesRequired(false, undefined, {
        isDefaultMachinePool: true,
        isMultiAz: true,
      });
      expect(minNodes).toEqual(9);
      const included = includedNodes({ isMultiAz: true }); // 9
      const expectedValues = [9, 12, 15, 18, 21, 24, 27];
      expect(expectedValues[expectedValues.length - 1]).toEqual(included + 18);

      render(<NodeCountInput {...baseProps({ isMultiAz: true })} isMultiAz machineType="fake" />);

      // Assert
      expect(screen.getByRole('combobox')).not.toBeDisabled();
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(expectedValues.length);

      options.forEach((option, index) => {
        expect(option).toHaveValue(`${expectedValues[index]}`);
        expect(option).toHaveAccessibleName(`${expectedValues[index] / 3}`);
      });
    });
  });

  it('Changes select to default value when machineType is set to a type if no quota', () => {
    // Arrange
    mockAvailableNodes.mockReturnValueOnce(15);
    const minNodes = getMinNodesRequired(false, undefined, {
      isDefaultMachinePool: true,
      isMultiAz: true,
    });
    expect(minNodes).toEqual(9);
    const onChange = jest.fn();
    const newProps = { ...baseProps({ isMultiAz: true }) };
    const inputProps = { ...newProps.input, onChange, value: 10 }; // note initial value is 10
    render(<NodeCountInput {...newProps} input={inputProps} machineType="fake2" isMultiAz />);

    // Assert
    expect(screen.getByRole('combobox')).toHaveValue(`${minNodes}`);
    expect(onChange).toBeCalledWith(minNodes);
  });

  describe('scaling existing', () => {
    describe('singleAZ', () => {
      it('renders with no quota above current value', () => {
        // Arrange
        mockAvailableNodes.mockReturnValueOnce(0);
        const minNodes = getMinNodesRequired(false, undefined, { isDefaultMachinePool: true });
        expect(minNodes).toEqual(4);
        render(<NodeCountInput {...baseProps({})} isEditingCluster currentNodeCount={6} />);

        // Assert
        expect(screen.getByRole('combobox')).not.toBeDisabled();
        const options = screen.getAllByRole('option');
        expect(options[options.length - 1]).toHaveValue(`${6}`);
        expect(options[options.length - 1]).toHaveAccessibleName(`${6}`);
      });
    });

    describe('multiAz', () => {
      it('renders with no quota above current value', () => {
        // Arrange
        mockAvailableNodes.mockReturnValueOnce(0);
        const minNodes = getMinNodesRequired(false, undefined, {
          isDefaultMachinePool: true,
          isMultiAz: true,
        });
        expect(minNodes).toEqual(9);
        render(
          <NodeCountInput
            {...baseProps({ isMultiAz: true })}
            isMultiAz
            isEditingCluster
            currentNodeCount={12}
          />,
        );

        // Assert
        expect(screen.getByRole('combobox')).not.toBeDisabled();
        const options = screen.getAllByRole('option');
        expect(options[options.length - 1]).toHaveValue(`${12}`);
        expect(options[options.length - 1]).toHaveAccessibleName(`${12 / 3}`);
      });
    });
  });

  describe('on load', () => {
    it('does not call onchange when current value is in the list of input values on mount', () => {
      // Arrange
      mockAvailableNodes.mockReturnValueOnce(0);
      const onChange = jest.fn();
      const newProps = { ...baseProps({ isByoc: true }) };
      const inputProps = { ...newProps.input, onChange, value: 3 }; // note initial value is 3
      const expectedValues = [2, 3, 4]; // note 3 is in the list
      render(
        <NodeCountInput {...newProps} input={inputProps} machineType="fake" isEditingCluster />,
      );
      // verify expected values:
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(expectedValues.length);
      options.forEach((option, index) => expect(option).toHaveValue(`${expectedValues[index]}`));

      // Assert
      expect(onChange).toBeCalledTimes(0);
    });
  });

  describe('On props update', () => {
    it('sends onchange with minimum nodes when changing machine types with not enough quota ROSA', () => {
      // Arrange
      mockAvailableNodes.mockReturnValue(10);
      const minNodes = getMinNodesRequired(false, undefined, { isDefaultMachinePool: true }); // expected to be 4
      expect(minNodes).toEqual(4); // validate min value
      const onChange = jest.fn();
      const newProps = { ...baseProps({}), product: normalizedProducts.ROSA };
      const inputProps = { ...newProps.input, onChange, value: 10 }; // note initial value is 10
      const { rerender } = render(
        <NodeCountInput {...newProps} input={inputProps} machineType="fake" />,
      );
      expect(screen.getByRole('combobox')).toHaveValue(`${10}`);
      expect(onChange).toBeCalledTimes(0);

      rerender(<NodeCountInput {...newProps} input={inputProps} machineType="fake2" />);

      // Assert
      expect(onChange).toBeCalledTimes(2);
      expect(onChange).toBeCalledWith(4);
    });
    it('sends onchange with minimum nodes when changing machine types with not enough quota OSD', () => {
      // Arrange
      mockAvailableNodes.mockReturnValue(10);
      const minNodes = getMinNodesRequired(false, undefined, { isDefaultMachinePool: true }); // expected to be 4
      expect(minNodes).toEqual(4); // validate min value
      const onChange = jest.fn();
      const newProps = { ...baseProps({}) };
      const inputProps = { ...newProps.input, onChange, value: 10 }; // note initial value is 10
      const { rerender } = render(
        <NodeCountInput {...newProps} input={inputProps} machineType="fake" />,
      );
      expect(screen.getByRole('combobox')).toHaveValue(`${10}`);
      expect(onChange).toBeCalledTimes(0);

      rerender(<NodeCountInput {...newProps} input={inputProps} machineType="fake2" />);

      // Assert
      expect(onChange).toBeCalledWith(4);
    });

    describe('Hypershift (HCP)', () => {
      it('sends onchange with new value the number the user picked * number of new pools', () => {
        // Arrange
        mockAvailableNodes.mockReturnValue(24);
        const onChange = jest.fn();
        const newProps = {
          ...baseProps({}),
          machineType: 'fake',
          isHypershiftWizard: true,
          product: normalizedProducts.ROSA,
        };
        const inputProps = { ...newProps.input, onChange, value: 6 };
        const { rerender } = render(
          <NodeCountInput
            {...newProps}
            input={inputProps}
            poolNumber={3}
            minNodes={getMinNodesRequired(true, { numMachinePools: 3 })}
          />,
        );
        // verify initial value
        expect(onChange).toBeCalledTimes(1);
        expect(screen.getByRole('combobox')).toHaveValue(`${6}`); // 6 = 2 nodes * 3 pools

        rerender(
          <NodeCountInput
            {...newProps}
            input={inputProps}
            poolNumber={5}
            minNodes={getMinNodesRequired(true, { numMachinePools: 5 })}
          />,
        );

        // Assert
        expect(onChange).toBeCalledTimes(3);
        expect(onChange).toBeCalledWith(10); // 10 = 2 nodes  * 5 pools
      });

      it('sends onchange with minimum nodes when the number the user picked * number of new pools is less than the min nodes', () => {
        // The minimum # of nodes for a HCP cluster is 2
        // Arrange
        mockAvailableNodes.mockReturnValue(24);
        const onChange = jest.fn();
        const newProps = {
          ...baseProps({}),
          machineType: 'fake',
          isHypershiftWizard: true,
          product: normalizedProducts.ROSA,
        };
        const inputProps = { ...newProps.input, onChange, value: 3 };

        const { rerender } = render(
          <NodeCountInput
            {...newProps}
            input={inputProps}
            poolNumber={3}
            minNodes={getMinNodesRequired(true, { numMachinePools: 3 })}
          />,
        );
        // verify initial value
        expect(onChange).toBeCalledTimes(1);
        expect(screen.getByRole('combobox')).toHaveValue(`${3}`); // 3 = 1 nodes * 3 pools

        rerender(
          <NodeCountInput
            {...newProps}
            input={inputProps}
            poolNumber={1}
            minNodes={getMinNodesRequired(true, { numMachinePools: 1 })}
          />,
        );

        // Assert
        const minNodes = getMinNodesRequired(true, { numMachinePools: 1 }); // min number of nodes for 1 machine pool
        expect(onChange).toBeCalledTimes(2);
        expect(onChange).toBeCalledWith(minNodes); // Returns min value of 2 vs 1 node * 1 pool (which would fail cluster creation)
      });

      // todo: we should investigate the cause for this test's failure - https://issues.redhat.com/browse/OCMUI-2379
      it.skip('sends onchange with minimum nodes when the number the user picked * number of new pools is greater than max nodes', () => {
        const maxNodes = MAX_NODES_HCP;
        const maxNodesForThreePools = MAX_NODES_HCP / 3;

        // Arrange
        mockAvailableNodes.mockReturnValue(200);
        const onChange = jest.fn();
        const newProps = {
          ...baseProps({}),
          machineType: 'fake',
          isHypershiftWizard: true,
          product: normalizedProducts.ROSA,
        };
        const inputProps = { ...newProps.input, onChange, value: maxNodes };

        const { rerender } = render(
          <NodeCountInput
            {...newProps}
            input={inputProps}
            poolNumber={maxNodesForThreePools}
            minNodes={getMinNodesRequired(true, { numMachinePools: maxNodesForThreePools })}
          />,
        );
        // verify initial value
        expect(onChange).toBeCalledTimes(0);
        expect(screen.getByRole('combobox')).toHaveValue(`${maxNodes}`); // 60 = 3 nodes * 20 pools

        rerender(
          <NodeCountInput
            {...newProps}
            input={inputProps}
            poolNumber={maxNodesForThreePools + 5}
            minNodes={getMinNodesRequired(true, { numMachinePools: maxNodesForThreePools + 5 })}
          />,
        );

        // Assert
        expect((maxNodesForThreePools + 5) * 3).toBeGreaterThan(maxNodes);
        expect(onChange).toBeCalledTimes(1);
        expect(onChange).toBeCalledWith(
          getMinNodesRequired(true, { numMachinePools: maxNodesForThreePools + 5 }),
        );
      });
    });
  });
});
