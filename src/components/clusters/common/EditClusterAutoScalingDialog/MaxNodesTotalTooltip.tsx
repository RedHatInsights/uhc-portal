import React from 'react';

import { Content, List, ListItem } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { MAX_NODES, MAX_NODES_INSUFFICIEN_VERSION } from '../machinePools/constants';

export const MaxNodesTotalPopoverText = () => {
  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);

  return (
    <Content>
      <Content component="p">
        The total number of master, infrastructure, and worker nodes of a single cluster. The
        maximum value for max-nodes-total should be the sum of:
        <List>
          <ListItem>
            <b>3 master nodes</b>
          </ListItem>
          <ListItem>
            <b>2 (single AZ) or 3 infrastructure nodes (multiple AZ)</b>
          </ListItem>
          {allow249NodesOSDCCSROSA ? (
            <ListItem>
              <b>Maximum worker node count</b>, based on the cluster version:
              <List>
                <ListItem>
                  <b>{MAX_NODES_INSUFFICIEN_VERSION}</b> for clusters below Openshift v4.14.14
                </ListItem>
                <ListItem>
                  <b>{MAX_NODES}</b> for clusters at or above Openshift v4.14.14
                </ListItem>
              </List>
            </ListItem>
          ) : (
            <ListItem>
              <b>Maximum worker node count ({MAX_NODES_INSUFFICIEN_VERSION})</b>
            </ListItem>
          )}
        </List>
      </Content>
    </Content>
  );
};

export const MaxNodesTotalPopover = () => (
  <PopoverHint title="Max nodes total" hint={<MaxNodesTotalPopoverText />} />
);
