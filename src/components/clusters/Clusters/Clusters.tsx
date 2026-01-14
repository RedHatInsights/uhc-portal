import React, { useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import {
  Badge,
  PageSection,
  Stack,
  StackItem,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import { Navigate, useNavigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import { TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { AccessRequest } from '../ClusterDetailsMultiRegion/components/AccessRequest/AccessRequest';
import ClusterList from '../ClusterListMultiRegion';
import ClusterTransferList from '../ClusterTransfer/ClusterTransferList';

import { ClustersPageHeader } from './ClustersPageHeader';
import { useCountPendingRequest } from './useCountPendingRequest';

const CLUSTERS_ROUTES = {
  BASE: '/clusters',
  LIST: '/list',
  REQUESTS: '/requests',
};

export const Clusters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTabbedClustersEnabled = useFeatureGate(TABBED_CLUSTERS);
  const activeTabKey = location.pathname.includes(CLUSTERS_ROUTES.REQUESTS) ? 'requests' : 'list';
  const handleTabSelect = useCallback(
    (_event: React.MouseEvent<HTMLElement>, tabKey: string | number) => {
      const targetPath =
        tabKey === 'requests'
          ? `${CLUSTERS_ROUTES.BASE}${CLUSTERS_ROUTES.REQUESTS}`
          : `${CLUSTERS_ROUTES.BASE}${CLUSTERS_ROUTES.LIST}`;
      navigate(targetPath);
    },
    [navigate],
  );
  const total = useCountPendingRequest();
  return (
    <AppPage title="Clusters | Red Hat OpenShift Cluster Manager">
      <ClustersPageHeader activeTabKey={activeTabKey} />
      <PageSection type="tabs">
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          usePageInsets
          role="region"
          aria-label="Clusters"
        >
          <Tab
            eventKey="list"
            title={<TabTitleText>Cluster List</TabTitleText>}
            aria-label="Cluster List"
            tabContentId="list"
          />
          <Tab
            eventKey="requests"
            title={
              <TabTitleText>Cluster Request {total ? <Badge>{total}</Badge> : null}</TabTitleText>
            }
            aria-label="Cluster Requests"
            tabContentId="requests"
          />
        </Tabs>
      </PageSection>
      <Routes>
        <Route
          index
          element={<Navigate to={`${CLUSTERS_ROUTES.BASE}${CLUSTERS_ROUTES.LIST}`} replace />}
        />
        <Route
          path={CLUSTERS_ROUTES.LIST}
          element={
            <TabContent id="list" activeKey={activeTabKey}>
              <TabContentBody>
                <ClusterList getMultiRegion showTabbedView />
              </TabContentBody>
            </TabContent>
          }
        />
        <Route
          path={CLUSTERS_ROUTES.REQUESTS}
          element={
            <TabContent id="requests" activeKey={activeTabKey}>
              <TabContentBody hasPadding>
                <Stack hasGutter>
                  <StackItem>
                    {isTabbedClustersEnabled && <AccessRequest showClusterName />}
                  </StackItem>
                  <StackItem>
                    <ClusterTransferList hideRefreshButton />
                  </StackItem>
                </Stack>
              </TabContentBody>
            </TabContent>
          }
        />
      </Routes>
    </AppPage>
  );
};
