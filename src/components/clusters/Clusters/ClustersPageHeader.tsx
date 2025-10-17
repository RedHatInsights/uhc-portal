import React from 'react';

import {
  Flex,
  FlexItem,
  Icon,
  PageSection,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import { RefreshButton } from '../ClusterListMultiRegion/components/RefreshButton';
import ReadOnlyBanner from '../common/ReadOnlyBanner';

type ClustersPageHeaderProps = {
  someReadOnly: boolean;
  showSpinner: boolean;
  error: boolean;
  refresh: () => void;
};
export const ClustersPageHeader = ({
  someReadOnly,
  showSpinner,
  error,
  refresh,
}: ClustersPageHeaderProps) => (
  <>
    <ReadOnlyBanner someReadOnly={someReadOnly} />
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
              {showSpinner && (
                <ToolbarItem>
                  <Spinner
                    size="lg"
                    className="cluster-list-spinner"
                    aria-label="Loading cluster list data"
                  />
                </ToolbarItem>
              )}
              {error && (
                <ToolbarItem>
                  <Icon status="warning">
                    <ExclamationTriangleIcon />
                  </Icon>
                </ToolbarItem>
              )}
              <ToolbarItem gap={{ default: 'gapNone' }}>
                <RefreshButton isDisabled={showSpinner} refreshFunc={refresh} />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </Flex>
    </PageSection>
  </>
);
