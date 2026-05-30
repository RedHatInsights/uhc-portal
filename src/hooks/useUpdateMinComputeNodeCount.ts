import {
  getMinNodesRequired,
  getNodeIncrementHypershift,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/machinePoolsHelper';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';

type UpdateMinComputeNodeCountParams = {
  newPoolsLength: number;
};

/**
 * Calculates the minimum compute node count based on the number of machine pools.
 * Returns null if no adjustment is needed, or the new minimum value if current nodes
 * are below the required minimum.
 */
const getMinComputeNodeCount = ({
  isHypershift,
  isByoc,
  isMultiAz,
  currentNodes,
  newPoolsLength,
}: {
  isHypershift: boolean;
  isByoc: boolean;
  isMultiAz: boolean;
  currentNodes: number | string | undefined;
  newPoolsLength: number;
}): number | null => {
  if (!isHypershift || currentNodes === undefined) {
    return null;
  }

  const minNodesRequired = getMinNodesRequired(
    isHypershift,
    { numMachinePools: newPoolsLength },
    { isDefaultMachinePool: true, isByoc, isMultiAz },
  );
  const increment = getNodeIncrementHypershift(newPoolsLength);
  const minUserInputNodes = minNodesRequired / increment;

  if (Number(currentNodes) < minUserInputNodes) {
    return minUserInputNodes;
  }

  return null;
};

/**
 * Hook to update the compute node count to the minimum required value after pool removal.
 * Reads form state internally and updates the NodesCompute field if the current value
 * is below the new minimum for the given pool count.
 */
function useUpdateMinComputeNodeCount() {
  const { values, setFieldValue } = useFormState();

  const updateMinComputeNodeCount = ({ newPoolsLength }: UpdateMinComputeNodeCountParams): void => {
    const adjustedNodeCount = getMinComputeNodeCount({
      isHypershift: values[FieldId.Hypershift] === 'true',
      isByoc: values[FieldId.Byoc] === 'true',
      isMultiAz: values[FieldId.MultiAz] === 'true',
      currentNodes: values[FieldId.NodesCompute],
      newPoolsLength,
    });

    if (adjustedNodeCount !== null) {
      setFieldValue(FieldId.NodesCompute, adjustedNodeCount, true);
    }
  };

  return { updateMinComputeNodeCount, getMinComputeNodeCount };
}

export { useUpdateMinComputeNodeCount, getMinComputeNodeCount };
