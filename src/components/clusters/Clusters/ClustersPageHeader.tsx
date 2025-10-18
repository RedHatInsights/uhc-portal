import React from 'react';

import {
  Flex,
  FlexItem,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { RefreshButton } from '../ClusterListMultiRegion/components/RefreshButton';

type ClustersPageHeaderProps = {
  refresh: () => void;
};
export const ClustersPageHeader = ({ refresh }: ClustersPageHeaderProps) => (
  <PageSection hasBodyWrapper={false}>
    <Flex>
      <FlexItem grow={{ default: 'grow' }}>
        <Title headingLevel="h1">Clusters</Title>
      </FlexItem>
      <Toolbar id="cluster-list-refresh-toolbar" isFullHeight inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup
            variant="action-group-plain"
            align={{ default: 'alignEnd' }}
            gap={{ default: 'gapNone', md: 'gapNone' }}
          >
            <ToolbarItem gap={{ default: 'gapNone' }}>
              <RefreshButton refreshFunc={refresh} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    </Flex>
  </PageSection>
);
