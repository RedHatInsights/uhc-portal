import React from 'react';

import { Badge, Spinner, TabTitleIcon, TabTitleText } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import { ClusterTabsId } from '../common/ClusterTabIds';

import { TabsRowInfoType, TabsRowTabType } from './TabsRow.model';

const AccessRequestIcon = ({
  numberOfIssues,
  isLoading,
}: {
  numberOfIssues?: number;
  isLoading?: boolean;
}) =>
  isLoading ? (
    <Spinner size="sm" aria-label="Loading..." />
  ) : (
    <Badge
      screenReaderText="Pending Access Requests"
      isRead={numberOfIssues === undefined || numberOfIssues === 0}
    >
      {numberOfIssues}
    </Badge>
  );

export const getTabs = (tabsInfo: TabsRowInfoType): TabsRowTabType[] => [
  {
    title: 'Overview',
    contentId: 'overviewTabContent',
    id: ClusterTabsId.OVERVIEW,
    show: true,
    ref: tabsInfo[ClusterTabsId.OVERVIEW].ref,
  },
  {
    title: (
      <>
        <TabTitleText>Monitoring</TabTitleText>
        {tabsInfo[ClusterTabsId.MONITORING].hasIssues ? (
          <TabTitleIcon id="monitoring-issues-icon">
            <ExclamationCircleIcon className="danger" />
          </TabTitleIcon>
        ) : null}
      </>
    ),
    contentId: 'monitoringTabContent',
    id: ClusterTabsId.MONITORING,
    show:
      tabsInfo[ClusterTabsId.MONITORING].show === undefined
        ? true
        : tabsInfo[ClusterTabsId.MONITORING].show,
    ref: tabsInfo[ClusterTabsId.MONITORING].ref,
  },
  {
    title: 'Access control',
    id: ClusterTabsId.ACCESS_CONTROL,
    contentId: 'accessControlTabContent',
    show: tabsInfo[ClusterTabsId.ACCESS_CONTROL].show,
    ref: tabsInfo[ClusterTabsId.ACCESS_CONTROL].ref,
  },
  {
    title: 'Add-ons',
    contentId: 'addOnsTabContent',
    id: ClusterTabsId.ADD_ONS,
    show: tabsInfo[ClusterTabsId.ADD_ONS].show,
    ref: tabsInfo[ClusterTabsId.ADD_ONS].ref,
  },
  {
    title: 'Cluster history',
    contentId: 'clusterHistoryTabContent',
    id: ClusterTabsId.CLUSTER_HISTORY,
    show: tabsInfo[ClusterTabsId.CLUSTER_HISTORY].show,
    ref: tabsInfo[ClusterTabsId.CLUSTER_HISTORY].ref,
  },
  {
    title: 'Networking',
    contentId: 'networkingTabContent',
    id: ClusterTabsId.NETWORKING,
    show: tabsInfo[ClusterTabsId.NETWORKING].show,
    ref: tabsInfo[ClusterTabsId.NETWORKING].ref,
  },
  {
    title: 'Machine pools',
    contentId: 'machinePoolsTabContent',
    id: ClusterTabsId.MACHINE_POOLS,
    show: tabsInfo[ClusterTabsId.MACHINE_POOLS].show,
    ref: tabsInfo[ClusterTabsId.MACHINE_POOLS].ref,
  },
  {
    title: 'Support',
    contentId: 'supportTabContent',
    id: ClusterTabsId.SUPPORT,
    show: tabsInfo[ClusterTabsId.SUPPORT].show,
    ref: tabsInfo[ClusterTabsId.SUPPORT].ref,
  },
  {
    title: 'Settings',
    contentId: 'upgradeSettingsTabContent',
    id: ClusterTabsId.UPDATE_SETTINGS,
    show: tabsInfo[ClusterTabsId.UPDATE_SETTINGS].show,
    ref: tabsInfo[ClusterTabsId.UPDATE_SETTINGS].ref,
  },
  {
    title: 'Add Hosts',
    contentId: 'addHostsContent',
    id: ClusterTabsId.ADD_ASSISTED_HOSTS,
    show: tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS].show,
    ref: tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS].ref,
    isDisabled: tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS].isDisabled,
    tooltip: tabsInfo[ClusterTabsId.ADD_ASSISTED_HOSTS].tooltip,
  },
  {
    title:
      tabsInfo[ClusterTabsId.ACCESS_REQUEST].isLoading ||
      tabsInfo[ClusterTabsId.ACCESS_REQUEST].numberOfIssues !== undefined ? (
        <>
          <TabTitleIcon style={{ paddingRight: '10px' }}>
            <AccessRequestIcon
              numberOfIssues={tabsInfo[ClusterTabsId.ACCESS_REQUEST].numberOfIssues}
              isLoading={tabsInfo[ClusterTabsId.ACCESS_REQUEST].isLoading}
            />
          </TabTitleIcon>
          <TabTitleText>Access Requests</TabTitleText>
        </>
      ) : (
        <TabTitleText>Access Requests</TabTitleText>
      ),
    contentId: 'accessRequestContent',
    id: ClusterTabsId.ACCESS_REQUEST,
    show: tabsInfo[ClusterTabsId.ACCESS_REQUEST].show,
    ref: tabsInfo[ClusterTabsId.ACCESS_REQUEST].ref,
    isDisabled: tabsInfo[ClusterTabsId.ACCESS_REQUEST].isDisabled,
    tooltip: tabsInfo[ClusterTabsId.ACCESS_REQUEST].tooltip,
  },
];

export const getInitTab = (tabs: TabsRowTabType[], initTabOpen?: string): TabsRowTabType =>
  tabs.find((tab) => tab.id === initTabOpen) ?? tabs[0];
