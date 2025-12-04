import React from 'react';
import { useLocation } from 'react-router-dom';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { CLUSTER_LIST_PATH, useNavigate } from '~/common/routing';

import { getInitTab, getTabs } from './TabsRow.helper';
import { TabsRowInfoType, TabsRowTabType } from './TabsRow.model';

export type TabsRowProps = {
  tabsInfo: TabsRowInfoType;
  initTabOpen?: string;
  onTabSelected: (...args: any[]) => void;
};

const TabsRow = ({ tabsInfo, onTabSelected, initTabOpen }: TabsRowProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = React.useState<TabsRowTabType[]>();
  const [activeTab, setActiveTab] = React.useState<TabsRowTabType>();
  const [previousTab, setPreviousTab] = React.useState<TabsRowTabType>();
  const [initialTab, setInitialTab] = React.useState<TabsRowTabType | null>();
  const [historyPush, setHistoryPush] = React.useState<boolean>(false);

  React.useEffect(() => {
    const newTabs = getTabs(tabsInfo);
    setTabs(newTabs);
  }, [tabsInfo]);

  const handleTabClick = React.useCallback(
    (
      _: React.MouseEvent<HTMLElement, MouseEvent> | undefined,
      tabIndex: number | string,
      historyPush = true,
    ) => {
      if (tabs) {
        setPreviousTab(activeTab);
        setActiveTab(tabs?.find((tab) => tab.key === tabIndex));
        setInitialTab(initialTab?.key === tabIndex ? null : initialTab);
        setHistoryPush(historyPush);
        tabs.forEach((tab) => {
          if (tab.ref && tab.ref.current) {
            if (tab.key !== tabIndex) {
              // eslint-disable-next-line no-param-reassign
              tab.ref.current.hidden = true;
            } else {
              // eslint-disable-next-line no-param-reassign
              tab.ref.current.hidden = false;
              onTabSelected(tab.id);
            }
          }
        });
      }
    },
    [tabs, activeTab, initialTab, onTabSelected],
  );

  React.useEffect(() => {
    const newTabs = getTabs(tabsInfo);
    setTabs(newTabs);
    setInitialTab(getInitTab(newTabs, initTabOpen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initTabOpen]); // TODO: tabsInfo should be added as soon as ClusterDetails is refactored

  React.useEffect(() => {
    if (tabs?.length) {
      if (initialTab !== null && (initialTab?.isDisabled || !initialTab?.show)) {
        setInitialTab(tabs[0]);
        handleTabClick(undefined, 0);
      }
    }
  }, [tabs, initialTab, handleTabClick]);

  React.useEffect(() => {
    if (tabs?.length) {
      const targetTab = tabs.find((tab) => `#${tab.id}` === location.hash);

      /* Checking if tab exists,
          otherwise we navigate to overview
          if the user did not click on back button,
          in that case we navigate to cluster list page */
      if (!targetTab?.show || targetTab.isDisabled) {
        if (location.hash === '') {
          navigate(CLUSTER_LIST_PATH, { replace: true });
        } else {
          setInitialTab(tabs[0]);
          navigate(
            {
              hash: `#${tabs[0].id}`,
            },
            { replace: true },
          );
        }
      }
      handleTabClick(
        undefined,
        targetTab?.isDisabled || !targetTab?.show ? 0 : targetTab.key,
        false,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]); // eslint wants dependencies, but we only need to listen to location.hash changes

  React.useEffect(() => {
    if (activeTab && !activeTab.show) {
      // TODO: this can only be true in case hidden tab is selected, it is not testeable, so I recommend to remove it
      handleTabClick(undefined, 0);
      // eslint-disable-next-line no-param-reassign
      tabsInfo.overview.ref.current.hidden = false;
    } else if (initialTab?.show && !initialTab?.isDisabled) {
      handleTabClick(undefined, initialTab.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, initialTab, handleTabClick]); // TODO: tabsInfo should be added as soon as ClusterDetails is refactored

  React.useEffect(() => {
    if (initialTab === null && historyPush) {
      if (previousTab?.key !== activeTab?.key) {
        navigate({
          hash: `#${activeTab?.id}`,
        });
      }
    }
  }, [activeTab, initialTab, historyPush, previousTab, navigate]);

  return tabs && activeTab ? (
    <Tabs activeKey={activeTab.key} onSelect={handleTabClick}>
      {tabs
        .filter((tab) => tab.show)
        .map((tab) => (
          <Tab
            key={tab.key}
            eventKey={tab.key}
            title={<TabTitleText>{tab.title}</TabTitleText>}
            tabContentId={tab.contentId}
            id={`${tab.title}`}
            ouiaId={`${tab.title}`}
            isAriaDisabled={!!tab.isDisabled}
            tooltip={tab.tooltip}
          />
        ))}
    </Tabs>
  ) : null;
};

export default TabsRow;
