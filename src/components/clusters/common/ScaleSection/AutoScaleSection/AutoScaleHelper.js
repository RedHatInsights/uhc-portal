import max from 'lodash/max';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';

const getMinNodesAllowed = ({
  isDefaultMachinePool,
  product,
  isBYOC,
  isMultiAz,
  autoScaleMinNodesValue = null,
  defaultMinAllowed = 0,
  isHypershiftWizard = false,
}) => {
  let currMinNodes = parseInt(autoScaleMinNodesValue, 10) || 0;
  // Note: currMinNodes is now expected to be per-zone values, so no multiplication needed
  // The old currMinNodes *= 3 logic has been removed to match per-zone architecture

  let minNodesAllowed;
  if (isDefaultMachinePool) {
    if (isBYOC || product === normalizedProducts.ROSA) {
      minNodesAllowed = isMultiAz ? 1 : 2; // 1 per zone for multi-AZ, 2 total for single-AZ
    } else {
      minNodesAllowed = isMultiAz ? 1 : 4; // 1 per zone for multi-AZ, 4 total for single-AZ
    }
  } else {
    minNodesAllowed = defaultMinAllowed;
  }
  return max([currMinNodes, minNodesAllowed]);
};

export const getNodesCount = (isBYOC, isMultiAz, asString, isHypershift = false) => {
  // For Hypershift: always return 2 nodes per machine pool (regardless of multi-AZ)
  if (isHypershift) {
    return asString ? '2' : 2;
  }

  // For Classic clusters: return per-zone values since submitOSDRequest multiplies by 3 for multi-zone
  const powExponent = isBYOC ? 1 : 2;
  const baseNodes = isMultiAz ? 1 : 2; // 1 per zone for multi-AZ, 2 total for single-AZ
  const computeNodes = baseNodes ** powExponent;
  return asString ? `${computeNodes}` : computeNodes;
};

export const getMinReplicasCount = (isBYOC, isMultiAz, asString, isHypershiftSelected = false) => {
  const nodesCount = getNodesCount(isBYOC, isMultiAz, false, isHypershiftSelected);
  // getNodesCount now returns per-zone values, so no need to divide by 3
  return asString ? `${nodesCount}` : nodesCount;
};

export const computeNodeHintText = (isHypershiftWizard, isAddEditHypershiftModal) => {
  switch (true) {
    case isHypershiftWizard:
      return constants.hcpComputeNodeCountHintWizard;
    case isAddEditHypershiftModal:
      return constants.hcpComputeNodeCountHint;
    default:
      return constants.computeNodeCountHint;
  }
};

export default getMinNodesAllowed;
