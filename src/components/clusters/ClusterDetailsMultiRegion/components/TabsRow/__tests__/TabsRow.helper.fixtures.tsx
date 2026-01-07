import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import { ClusterTabsId } from '../../common/ClusterTabIds';
import { TabsRowInfoType, TabsRowTabType } from '../TabsRow.model';

export const mocksTabsRowTab: TabsRowTabType[] = [
  {
    title: 'title 0',
    contentId: 'contentId 0',
    id: ClusterTabsId.OVERVIEW,
    ref: { current: { hidden: false } },
  },
  {
    title: 'title 1',
    contentId: 'contentId 1',
    id: ClusterTabsId.ACCESS_CONTROL,
    ref: { current: { hidden: false } },
  },
];

export const regularTabsInfoAllShow: TabsRowInfoType = {
  overview: { ref: { current: 'overviewRef' }, hasIssues: false, show: true },
  monitoring: { ref: { current: 'monitoringRef' }, hasIssues: false, show: true },
  accessControl: { ref: { current: 'accessControlRef' }, hasIssues: false, show: true },
  addOns: { ref: { current: 'addOnsRef' }, hasIssues: false, show: true },
  clusterHistory: { ref: { current: 'clusterHistoryRef' }, hasIssues: false, show: true },
  networking: { ref: { current: 'networkingRef' }, hasIssues: false, show: true },
  machinePools: { ref: { current: 'machinePoolsRef' }, hasIssues: false, show: true },
  support: { ref: { current: 'supportRef' }, hasIssues: false, show: true },
  updateSettings: { ref: { current: 'upgradeSettingsRef' }, hasIssues: false, show: true },
  addAssistedHosts: {
    ref: { current: 'addAssistedRef' },
    hasIssues: false,
    show: true,
    tooltip: <Tooltip content="whatever" />,
  },
  accessRequest: { ref: { current: 'accessRequestRef' }, hasIssues: false, show: true },
};

export const regularTabsInfoAllHidden: TabsRowInfoType = {
  overview: { ref: { current: 'overviewRef' }, hasIssues: false, show: false },
  monitoring: { ref: { current: 'monitoringRef' }, hasIssues: false, show: false },
  accessControl: { ref: { current: 'accessControlRef' }, hasIssues: false, show: false },
  addOns: { ref: { current: 'addOnsRef' }, hasIssues: false, show: false },
  clusterHistory: { ref: { current: 'clusterHistoryRef' }, hasIssues: false, show: false },
  networking: { ref: { current: 'networkingRef' }, hasIssues: false, show: false },
  machinePools: { ref: { current: 'machinePoolsRef' }, hasIssues: false, show: false },
  support: { ref: { current: 'supportRef' }, hasIssues: false, show: false },
  updateSettings: { ref: { current: 'upgradeSettingsRef' }, hasIssues: false, show: false },
  addAssistedHosts: { ref: { current: 'addAssistedRef' }, hasIssues: false, show: false },
  accessRequest: { ref: { current: 'accessRequestRef' }, hasIssues: false, show: false },
};

export const regularTabsInfoMonitoringUndefined: TabsRowInfoType = {
  overview: { ref: { current: 'overviewRef' }, hasIssues: false, show: false },
  monitoring: { ref: { current: 'monitoringRef' }, hasIssues: false },
  accessControl: { ref: { current: 'accessControlRef' }, hasIssues: false, show: false },
  addOns: { ref: { current: 'addOnsRef' }, hasIssues: false, show: false },
  clusterHistory: { ref: { current: 'clusterHistoryRef' }, hasIssues: false, show: false },
  networking: { ref: { current: 'networkingRef' }, hasIssues: false, show: false },
  machinePools: { ref: { current: 'machinePoolsRef' }, hasIssues: false, show: false },
  support: { ref: { current: 'supportRef' }, hasIssues: false, show: false },
  updateSettings: { ref: { current: 'upgradeSettingsRef' }, hasIssues: false, show: false },
  addAssistedHosts: { ref: { current: 'addAssistedRef' }, hasIssues: false, show: false },
  accessRequest: { ref: { current: 'accessRequestRef' }, hasIssues: false, show: false },
};

export const regularTabsInfoMonitoringHasIssues: TabsRowInfoType = {
  overview: { ref: { current: 'overviewRef' }, hasIssues: false, show: false },
  monitoring: { ref: { current: 'monitoringRef' }, hasIssues: true },
  accessControl: { ref: { current: 'accessControlRef' }, hasIssues: false, show: false },
  addOns: { ref: { current: 'addOnsRef' }, hasIssues: false, show: false },
  clusterHistory: { ref: { current: 'clusterHistoryRef' }, hasIssues: false, show: false },
  networking: { ref: { current: 'networkingRef' }, hasIssues: false, show: false },
  machinePools: { ref: { current: 'machinePoolsRef' }, hasIssues: false, show: false },
  support: { ref: { current: 'supportRef' }, hasIssues: false, show: false },
  updateSettings: { ref: { current: 'upgradeSettingsRef' }, hasIssues: false, show: false },
  addAssistedHosts: { ref: { current: 'addAssistedRef' }, hasIssues: false, show: false },
  accessRequest: { ref: { current: 'accessRequestRef' }, hasIssues: false, show: false },
};
