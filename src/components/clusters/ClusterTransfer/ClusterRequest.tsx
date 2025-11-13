import React from 'react';

import {
  Flex,
  FlexItem,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import { refetchAccessRequests } from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessRequests';
import { refetchClusterTransferDetail } from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { AccessRequest } from '../ClusterDetailsMultiRegion/components/AccessRequest/AccessRequest';
import { RefreshButton } from '../ClusterListMultiRegion/components/RefreshButton';

import ClusterTransferList from './ClusterTransferList';

const ClusterRequestList = () => {
  const PAGE_TITLE = 'Cluster Request | Red Hat OpenShift Cluster Manager';
  const breadCrumbs = (
    <Breadcrumbs path={[{ label: 'Cluster List' }, { label: 'Cluster Requests' }]} />
  );
  const refresh = () => {
    refetchAccessRequests();
    refetchClusterTransferDetail();
  };
  const isTabbedClustersEnabled = useFeatureGate(TABBED_CLUSTERS);
  return (
    <AppPage title={PAGE_TITLE}>
      <PageSection hasBodyWrapper={false}>
        <Flex>
          <FlexItem colSpan={12}>
            <Split>
              <SplitItem className="pf-v6-u-pb-md">{breadCrumbs}</SplitItem>
            </Split>
          </FlexItem>
        </Flex>
        <Flex>
          <FlexItem grow={{ default: 'grow' }}>
            <Title headingLevel="h1">Cluster Requests</Title>
          </FlexItem>
          <Toolbar id="cluster-list-refresh-toolbar" isFullHeight inset={{ default: 'insetNone' }}>
            <ToolbarContent>
              <ToolbarGroup
                variant="action-group-plain"
                align={{ default: 'alignEnd' }}
                gap={{ default: 'gapNone', md: 'gapNone' }}
              >
                <ToolbarItem gap={{ default: 'gapNone' }}>
                  {isTabbedClustersEnabled && (
                    <RefreshButton isDisabled={false} refreshFunc={refresh} />
                  )}
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </Flex>
      </PageSection>
      <PageSection>
        <Stack hasGutter>
          <StackItem>{isTabbedClustersEnabled && <AccessRequest showClusterName />}</StackItem>
          <StackItem>
            <ClusterTransferList hideRefreshButton />
          </StackItem>
        </Stack>
      </PageSection>
    </AppPage>
  );
};
export default ClusterRequestList;
