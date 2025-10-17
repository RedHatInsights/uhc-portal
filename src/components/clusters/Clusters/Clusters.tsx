import React from 'react';
import { useLocation } from 'react-router-dom';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { ListTab } from '~/components/clusters/ClusterListMultiRegion';
import { refetchClusterTransferDetail } from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { useFetchClusters } from '~/queries/ClusterListQueries/useFetchClusters';

import ClusterTransferList from '../ClusterTransfer/ClusterTransferList';

import { ClustersPageHeader } from './ClustersPageHeader';

const DEFAULT_TAB = 'list';

export const Clusters = () => {
  const { refetch } = useFetchClusters(false, true);

  const refresh = () => {
    refetch();
    refetchClusterTransferDetail();
  };
  const location = useLocation();

  // Get tab key from hash, or use default
  const getTabFromHash = (): string => {
    const hash = location.hash.replace('#', '');
    return hash || DEFAULT_TAB;
  };

  const [activeTabKey, setActiveTabKey] = React.useState<string>(getTabFromHash());

  // Update active tab when hash changes
  React.useEffect(() => {
    const hash = location.hash.replace('#', '');
    const tabKey = hash || DEFAULT_TAB;
    setActiveTabKey(tabKey);
  }, [location.hash]);

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent> | undefined,
    tabKey: number | string,
  ) => {
    const tabKeyStr = String(tabKey);
    setActiveTabKey(tabKeyStr);
    window.location.hash = tabKeyStr;
  };

  return (
    <>
      <ClustersPageHeader refresh={refresh} />
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} role="region" aria-label="Clusters">
        <Tab
          eventKey="list"
          title={<TabTitleText>Cluster List</TabTitleText>}
          aria-label="Cluster List"
        >
          <ListTab getMultiRegion />
        </Tab>
        <Tab
          eventKey="requests"
          title={<TabTitleText>Cluster Requests</TabTitleText>}
          aria-label="Cluster Requests"
        >
          <ClusterTransferList />
        </Tab>
      </Tabs>
    </>
  );
};
