import React from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import SecurityGroupsViewList from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsViewList';
import { SecurityGroup } from '~/types/clusters_mgmt.v1';

type SecurityGroupsTableProps = {
  vpcGroups: SecurityGroup[];
  formGroups: {
    applyControlPlaneToAll: boolean;
    controlPlane: string[];
    infra: string[];
    worker: string[];
  };
};

export const buildSecurityGroups = (vpcGroups: SecurityGroup[], selectedGroupIds: string[]) =>
  selectedGroupIds.map((selectedGroupId) => {
    const sgDetails = vpcGroups.find((vpcGroup) => vpcGroup.id === selectedGroupId) || {
      name: selectedGroupId,
    };
    return { id: selectedGroupId, name: sgDetails.name };
  });

const SecurityGroupByNodeType = ({
  vpcGroups,
  selectedGroupIds,
  nodeType,
}: {
  vpcGroups: SecurityGroup[];
  selectedGroupIds: string[];
  nodeType: 'Control plane' | 'Worker' | 'Infrastructure' | 'All';
}) => (
  <Flex direction={{ default: 'column' }}>
    <FlexItem>
      <strong>{nodeType} nodes</strong>
    </FlexItem>
    <FlexItem wrap="wrap">
      <SecurityGroupsViewList securityGroups={buildSecurityGroups(vpcGroups, selectedGroupIds)} />
    </FlexItem>
  </Flex>
);

const SecurityGroupsTable = ({ vpcGroups, formGroups }: SecurityGroupsTableProps) => (
  <>
    {formGroups.controlPlane.length > 0 && (
      <SecurityGroupByNodeType
        nodeType={formGroups.applyControlPlaneToAll ? 'All' : 'Control plane'}
        vpcGroups={vpcGroups}
        selectedGroupIds={formGroups.controlPlane}
      />
    )}
    {!formGroups.applyControlPlaneToAll && (
      <>
        {formGroups.infra.length > 0 && (
          <SecurityGroupByNodeType
            nodeType="Infrastructure"
            vpcGroups={vpcGroups}
            selectedGroupIds={formGroups.infra}
          />
        )}
        {formGroups.worker.length > 0 && (
          <SecurityGroupByNodeType
            nodeType="Worker"
            vpcGroups={vpcGroups}
            selectedGroupIds={formGroups.worker}
          />
        )}
      </>
    )}
  </>
);

export default SecurityGroupsTable;
