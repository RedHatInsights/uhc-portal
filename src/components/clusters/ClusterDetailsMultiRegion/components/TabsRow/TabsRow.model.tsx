import React, { RefObject } from 'react';

import { ClusterTabsId } from '../common/ClusterTabIds';

export type TabsRowTabType = {
  title: string | React.ReactNode;
  contentId: string;
  id: ClusterTabsId;
} & TabsRowTabProperties;

export type TabsRowTabProperties = {
  show?: boolean;
  ref: RefObject<any>;
  isDisabled?: boolean;
  tooltip?: React.ReactElement<any>;
  hasIssues?: boolean;
  numberOfIssues?: number;
  isLoading?: boolean;
};

export type TabsRowInfoType = {
  [ClusterTabsId.OVERVIEW]: TabsRowTabProperties;
  [ClusterTabsId.MONITORING]: TabsRowTabProperties;
  [ClusterTabsId.ACCESS_CONTROL]: TabsRowTabProperties;
  [ClusterTabsId.ADD_ONS]: TabsRowTabProperties;
  [ClusterTabsId.CLUSTER_HISTORY]: TabsRowTabProperties;
  [ClusterTabsId.NETWORKING]: TabsRowTabProperties;
  [ClusterTabsId.MACHINE_POOLS]: TabsRowTabProperties;
  [ClusterTabsId.SUPPORT]: TabsRowTabProperties;
  [ClusterTabsId.UPDATE_SETTINGS]: TabsRowTabProperties;
  [ClusterTabsId.ADD_ASSISTED_HOSTS]: TabsRowTabProperties;
  [ClusterTabsId.ACCESS_REQUEST]: TabsRowTabProperties;
};
