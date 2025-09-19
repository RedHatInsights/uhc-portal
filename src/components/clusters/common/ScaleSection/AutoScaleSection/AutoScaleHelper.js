import max from 'lodash/max';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import {
  DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ,
  DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ,
  DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ,
  DEFAULT_NODE_COUNT_REDHAT_SINGLE_AZ,
} from '~/components/clusters/wizards/common/constants';

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
  if (isMultiAz && !isHypershiftWizard) {
    currMinNodes *= 3;
  }
  let minNodesAllowed;
  if (isDefaultMachinePool) {
    if (isBYOC || product === normalizedProducts.ROSA) {
      minNodesAllowed = isMultiAz ? 3 : 2;
    } else {
      minNodesAllowed = isMultiAz ? 9 : 4;
    }
  } else {
    minNodesAllowed = defaultMinAllowed;
  }
  return max([currMinNodes, minNodesAllowed]);
};

export const getNodesCount = (isBYOC, isMultiAz, asString) => {
  // Function is called when user switches between Single and Multi-Zones, in both ROSA and OSD wizards, and
  // also to initialize the OSD ComputeNodeCount component.

  let computeNodes;

  // 'isBYOC' is used by the OSD Wizard. 'true' is 'Customer cloud subscription', 'false' is 'Red Hat cloud account'.
  // When called from Rosa Wizard, isBYOC is always 'true'.
  if (isBYOC && isMultiAz) computeNodes = DEFAULT_NODE_COUNT_CUSTOMER_MULTI_AZ;
  else if (isBYOC && !isMultiAz) computeNodes = DEFAULT_NODE_COUNT_CUSTOMER_SINGLE_AZ;
  else if (!isBYOC && isMultiAz) computeNodes = DEFAULT_NODE_COUNT_REDHAT_MULTI_AZ;
  else computeNodes = DEFAULT_NODE_COUNT_REDHAT_SINGLE_AZ; // !isBYOC && !isMultiAz

  return asString ? `${computeNodes}` : computeNodes;
};

export const getMinReplicasCount = (isBYOC, isMultiAz, asString, isHypershiftSelected = false) => {
  const nodesCount = getNodesCount(isBYOC, isMultiAz, false);
  const minReplicas = isMultiAz && !isHypershiftSelected ? nodesCount / 3 : nodesCount;
  return asString ? `${minReplicas}` : minReplicas;
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
