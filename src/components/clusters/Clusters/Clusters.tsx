import React from 'react';
import { useLocation } from 'react-router-dom';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { useNavigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';

import ClusterList from '../ClusterListMultiRegion';
import ClusterTransferList from '../ClusterTransfer/ClusterTransferList';

import { ClustersPageHeader } from './ClustersPageHeader';

const DEFAULT_TAB = 'list';

export const Clusters = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    navigate(`${location.pathname}#${tabKeyStr}`);
  };

  return (
    <AppPage>
      <ClustersPageHeader />
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} role="region" aria-label="Clusters">
        <Tab
          eventKey="list"
          title={<TabTitleText>Cluster List</TabTitleText>}
          aria-label="Cluster List"
        >
          <ClusterList getMultiRegion showTabbedView />
        </Tab>
        <Tab
          eventKey="requests"
          title={<TabTitleText>Cluster Requests</TabTitleText>}
          aria-label="Cluster Requests"
        >
          <ClusterTransferList hideRefreshButton />
        </Tab>
      </Tabs>
    </AppPage>
  );
};
