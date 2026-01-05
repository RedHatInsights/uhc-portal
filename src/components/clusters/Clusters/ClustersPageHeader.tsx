import React from 'react';

import {
  Flex,
  FlexItem,
  PageSection,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { refetchAccessRequests } from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessRequests';
import {
  refetchClusterTransferDetail,
  useFetchClusterTransferDetail,
} from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { useFetchClusters } from '~/queries/ClusterListQueries/useFetchClusters';
import { useGlobalState } from '~/redux/hooks';

import { RefreshButton } from '../ClusterListMultiRegion/components/RefreshButton';
import ErrorTriangle from '../common/ErrorTriangle';

export const ClustersPageHeader = ({ activeTabKey }: { activeTabKey: string }) => {
  const {
    isLoading: isClustersLoading,
    refetch,
    isFetching: isClustersFetching,
    isError: isClustersError,
    errors: clustersError,
  } = useFetchClusters(false, true);
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);

  const { isLoading: isTransferLoading, isError: isTransferError } = useFetchClusterTransferDetail({
    username,
  });

  // Leaving these varaibles for when we add access request data
  const isError = isClustersError || isTransferError;
  const showSpinner = isClustersFetching || isClustersLoading || isTransferLoading;
  const errorMessage = clustersError?.[0]?.reason;

  const refresh = () => {
    if (activeTabKey === 'list') {
      refetch();
    }
    refetchClusterTransferDetail();
    refetchAccessRequests();
  };

  return (
    <PageSection hasBodyWrapper={false}>
      <Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <Title headingLevel="h1">Clusters</Title>
        </FlexItem>
        <Toolbar id="clusters-refresh-toolbar" isFullHeight inset={{ default: 'insetNone' }}>
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
                    aria-label="Loading cluster data"
                  />
                </ToolbarItem>
              )}
              {isError && (
                <ToolbarItem alignSelf="baseline" style={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorTriangle errorMessage={errorMessage} item="clusters" />
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
  );
};
