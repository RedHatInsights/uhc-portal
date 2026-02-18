import React, { useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import {
  Badge,
  Button,
  PageSection,
  Popover,
  Stack,
  StackItem,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import { ACM_HUB_DOCUMENTATION_LINKS } from '~/common/acmHubConstants';
import { Navigate, useNavigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import ExternalLink from '~/components/common/ExternalLink';
import { ACM_CLUSTER_TAGGING, TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { AcmHubClusterList } from '../AcmHubClusters';
import { AccessRequest } from '../ClusterDetailsMultiRegion/components/AccessRequest/AccessRequest';
import ClusterList from '../ClusterListMultiRegion';
import ClusterTransferList from '../ClusterTransfer/ClusterTransferList';

import { ClustersPageHeader } from './ClustersPageHeader';
import { useCountPendingRequest } from './useCountPendingRequest';

const CLUSTERS_ROUTES = {
  BASE: '/clusters',
  LIST: '/list',
  REQUESTS: '/requests',
  HUB_CLUSTERS: '/hub-clusters',
};

const getActiveTabKey = (pathname: string): string => {
  if (pathname.includes(CLUSTERS_ROUTES.REQUESTS)) {
    return 'requests';
  }
  if (pathname.includes(CLUSTERS_ROUTES.HUB_CLUSTERS)) {
    return 'hub-clusters';
  }
  return 'list';
};

export const Clusters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTabbedClustersEnabled = useFeatureGate(TABBED_CLUSTERS);
  const isACMClusterTaggingEnabled = useFeatureGate(ACM_CLUSTER_TAGGING);
  const activeTabKey = getActiveTabKey(location.pathname);
  const handleTabSelect = useCallback(
    (_event: React.MouseEvent<HTMLElement>, tabKey: string | number) => {
      let targetPath = `${CLUSTERS_ROUTES.BASE}${CLUSTERS_ROUTES.LIST}`;
      if (tabKey === 'requests') {
        targetPath = `${CLUSTERS_ROUTES.BASE}${CLUSTERS_ROUTES.REQUESTS}`;
      } else if (tabKey === 'hub-clusters') {
        targetPath = `${CLUSTERS_ROUTES.BASE}${CLUSTERS_ROUTES.HUB_CLUSTERS}`;
      }
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
          {isACMClusterTaggingEnabled ? (
            <Tab
              eventKey="hub-clusters"
              title={
                <TabTitleText>
                  Hub Clusters
                  <Popover
                    bodyContent="View clusters you tagged as Red Hat Advanced Cluster Management for Kubernetes (ACM) Hub clusters."
                    footerContent={
                      <ExternalLink href={ACM_HUB_DOCUMENTATION_LINKS.CLUSTER_HUB_DOCUMENTATION}>
                        Learn more
                      </ExternalLink>
                    }
                    position="top"
                  >
                    <Button
                      icon={<OutlinedQuestionCircleIcon />}
                      variant="plain"
                      aria-label="More info about Hub Clusters"
                      className="pf-v6-u-p-0 pf-v6-u-ml-xs"
                    />
                  </Popover>
                </TabTitleText>
              }
              aria-label="Hub Clusters"
              tabContentId="hub-clusters"
            />
          ) : null}
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
        {isACMClusterTaggingEnabled ? (
          <Route
            path={CLUSTERS_ROUTES.HUB_CLUSTERS}
            element={
              <TabContent id="hub-clusters" activeKey={activeTabKey}>
                <TabContentBody>
                  <AcmHubClusterList />
                </TabContentBody>
              </TabContent>
            }
          />
        ) : null}
      </Routes>
    </AppPage>
  );
};
