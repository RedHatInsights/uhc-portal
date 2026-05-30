import React from 'react';
import { useLocation } from 'react-router-dom';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { useNavigate } from '~/common/routing';
import useAnalytics from '~/hooks/useAnalytics';

import { ClusterTabsId } from '../common/ClusterTabIds';

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
  const track = useAnalytics();

  const [tabs, setTabs] = React.useState<TabsRowTabType[]>();
  const [activeTab, setActiveTab] = React.useState<TabsRowTabType>();
  const [previousTab, setPreviousTab] = React.useState<TabsRowTabType>();
  const [initialTab, setInitialTab] = React.useState<TabsRowTabType | null>();
  const [historyPush, setHistoryPush] = React.useState<boolean>(false);
  const [redirectedToOverview, setRedirectedToOverview] = React.useState<boolean>(false);

  React.useEffect(() => {
    const newTabs = getTabs(tabsInfo);
    setTabs(newTabs);

    // Check if user came to page with invalid hash
    if (location.hash !== '') {
      const targetTab = newTabs.find((tab) => `#${tab.id}` === location.hash);
      if (!targetTab) {
        setRedirectedToOverview(true);
      }
    }
  }, [tabsInfo, location.hash]);

  const handleTabChange = React.useCallback(
    (tabIndex: number | string, historyPush = true) => {
      if (tabs) {
        setPreviousTab(activeTab);
        setActiveTab(tabs?.find((tab) => tab.id === tabIndex));
        setInitialTab(initialTab?.id === tabIndex ? null : initialTab);
        setHistoryPush(historyPush);
        tabs.forEach((tab) => {
          if (tab.ref && tab.ref.current) {
            if (tab.id !== tabIndex) {
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

  const handleTabClick = React.useCallback(
    (_: React.MouseEvent<HTMLElement, MouseEvent> | undefined, tabKey: number | string) => {
      handleTabChange(tabKey);
    },
    [handleTabChange],
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
        setInitialTab(tabs.find((tab) => tab.id === ClusterTabsId.OVERVIEW) || tabs[0]);
        handleTabChange(ClusterTabsId.OVERVIEW);
      }
    }
  }, [tabs, initialTab, handleTabChange]);

  React.useEffect(() => {
    if (!tabs?.length) return;

    /* Empty hash: initial tab + hash sync are handled by the other effects. Without this guard,
     * adding deps below would duplicate handleTabChange and fight initTabOpen. */
    if (location.hash === '') {
      return;
    }

    const targetTab = tabs.find((tab) => `#${tab.id}` === location.hash);

    /* No hash or unknown/disabled tab: normalize URL to #overview on this page.
     * Do not navigate to cluster list — replacing the details URL with the list path
     * drops the previous history entry (e.g. Cluster Requests) and breaks browser Back. */
    if (!targetTab?.show || targetTab.isDisabled) {
      setInitialTab(tabs.find((tab) => tab.id === ClusterTabsId.OVERVIEW) || tabs[0]);
      navigate(
        {
          hash: `#${ClusterTabsId.OVERVIEW}`,
        },
        { replace: true },
      );
    }
    handleTabChange(
      targetTab?.isDisabled || !targetTab?.show ? ClusterTabsId.OVERVIEW : targetTab.id,
      false,
    );
    /* Use tabs?.length (not `tabs`) so this runs when the list first resolves or its size changes,
     * without re-running on every new array reference from setTabs(getTabs(...)).
     * navigate, setInitialTab, handleTabChange: see exhaustive-deps disable below. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, tabs?.length]);

  React.useEffect(() => {
    if (activeTab && !activeTab.show) {
      // TODO: this can only be true in case hidden tab is selected, it is not testeable, so I recommend to remove it
      handleTabChange(ClusterTabsId.OVERVIEW);
      // eslint-disable-next-line no-param-reassign
      tabsInfo[ClusterTabsId.OVERVIEW].ref.current.hidden = false;
    } else if (initialTab?.show && !initialTab?.isDisabled) {
      if (!initTabOpen && initialTab.id === ClusterTabsId.OVERVIEW) {
        setRedirectedToOverview(true);
      }
      handleTabChange(initialTab.id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, initialTab, handleTabChange]); // TODO: tabsInfo should be added as soon as ClusterDetails is refactored

  React.useEffect(() => {
    if (initialTab === null && historyPush) {
      if (previousTab?.id !== activeTab?.id) {
        const trackingProperties = {
          tab_name: activeTab?.id,
          initial_load: false,
          redirected_to_default_tab: false,
        };

        if (!previousTab?.id) {
          trackingProperties.initial_load = true;
          trackingProperties.redirected_to_default_tab = redirectedToOverview;
        }
        track(trackEvents.ClusterTabs, {
          customProperties: trackingProperties,
        });
        /* Initial tab sync must use replace — otherwise we push a second details entry
         * (hash normalization + this navigate) and Chrome requires Back twice to leave. */
        navigate(
          {
            hash: `#${activeTab?.id}`,
          },
          { replace: !previousTab?.id },
        );
      }
    }
  }, [activeTab, initialTab, historyPush, previousTab, navigate, redirectedToOverview, track]);

  return tabs && activeTab ? (
    <Tabs activeKey={activeTab.id} onSelect={handleTabClick}>
      {tabs
        .filter((tab) => tab.show)
        .map((tab) => (
          <Tab
            key={tab.id}
            eventKey={tab.id}
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
