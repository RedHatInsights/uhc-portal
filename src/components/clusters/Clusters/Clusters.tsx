import React, { useMemo } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { Button, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { Link, Navigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';

import ClusterList from '../ClusterListMultiRegion';
import ClusterTransferList from '../ClusterTransfer/ClusterTransferList';

import { ClustersPageHeader } from './ClustersPageHeader';

export const Clusters = () => {
  const location = useLocation();
  const activeTabKey = useMemo(() => {
    const path = location.pathname;

    if (path.endsWith('/list') || path.endsWith('/list/')) return 'list';
    if (path.endsWith('/requests') || path.endsWith('/requests/')) return 'requests';

    return 'list';
  }, [location.pathname]);

  return (
    <AppPage>
      <ClustersPageHeader />
      <Tabs activeKey={activeTabKey} role="region" aria-label="Clusters">
        <Tab
          eventKey="list"
          title={
            <Link to="/clusters/list">
              <TabTitleText>
                <Button variant="plain">Cluster List</Button>
              </TabTitleText>
            </Link>
          }
          aria-label="Cluster List"
        />
        <Tab
          eventKey="requests"
          title={
            <Link to="/clusters/requests">
              <Button variant="plain">Cluster Requests</Button>
            </Link>
          }
          aria-label="Cluster Requests"
        />
      </Tabs>
      <Routes>
        <Route index element={<Navigate to="/clusters/list" replace />} />
        <Route path="list" element={<ClusterList getMultiRegion showTabbedView />} />
        <Route path="requests" element={<ClusterTransferList hideRefreshButton />} />
      </Routes>
    </AppPage>
  );
};
