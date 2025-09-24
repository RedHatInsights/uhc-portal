import React, { useMemo } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { Tab, Tabs, TabsComponent, TabTitleText } from '@patternfly/react-core';

import { Link, Navigate } from '~/common/routing';
import ClusterTransferList from '~/components/clusters/ClusterTransfer/ClusterTransferList';

import ClusterListMultiRegion from '../ClusterListMultiRegion';

export const ClustersNew = () => {
  const location = useLocation();

  const activeTabKey = useMemo(() => {
    const path = location.pathname;

    if (path.endsWith('/list')) return 'list';
    if (path.endsWith('/requests')) return 'requests';

    return 'list';
  }, [location.pathname]);

  return (
    <>
      <Tabs
        activeKey={activeTabKey}
        component={TabsComponent.div}
        aria-label="Tabs in the nav element example"
      >
        <Tab
          eventKey="list"
          title={
            <Link to="/cluster-list/list">
              <TabTitleText>List</TabTitleText>
            </Link>
          }
        />
        <Tab
          eventKey="requests"
          title={
            <Link to="/cluster-list/requests">
              <TabTitleText>Requests</TabTitleText>
            </Link>
          }
        />
      </Tabs>
      <Routes>
        <Route index element={<Navigate to="/cluster-list/list" replace />} />
        <Route path="list" element={<ClusterListMultiRegion getMultiRegion />} />
        <Route path="requests" element={<ClusterTransferList />} />
      </Routes>
    </>
  );
};
