import React from 'react';

import type { Cluster as AICluster } from '@openshift-assisted/types/assisted-installer-service';
import type { FeaturesSupportsLevel } from '@openshift-assisted/ui-lib/ocm';
import type { ChromeAPI } from '@redhat-cloud-services/types';

import type { List, OneMetric, Subscription } from './accounts_mgmt.v1';
import type {
  Aws,
  Cluster,
  ClusterApi,
  ClusterState,
  ClusterStatus,
  LimitedSupportReason,
  UpgradePolicy,
  UpgradePolicyState,
  VersionGateAgreement,
} from './clusters_mgmt.v1';

export type Chrome = ChromeAPI & {
  enable: {
    // missing debug function types
    segmentDev: () => void;
  };
};

export type ViewOptionsFilter =
  | string
  | { description?: string; loggedBy?: string; timestampFrom?: string; timestampTo?: string };

export type ViewOptions = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  filter: ViewOptionsFilter;
  sorting: {
    sortField: string;
    isAscending: boolean;
    sortIndex: number;
  };
  flags: {
    [flag: string]: any;
  };
};

// picking specific Cluster properties to satisfy requirements for
export type FakeCluster = // AICluster &
  Pick<
    Cluster,
    | 'id'
    | 'cloud_provider'
    | 'region'
    | 'console'
    | 'creation_timestamp'
    | 'openshift_version'
    | 'managed'
    | 'ccs'
    | 'external_id'
    | 'external_auth_config'
    | 'inflight_checks'
    | 'name'
    | 'version'
    | 'hypershift'
    | 'aws'
    | 'gcp'
    | 'gcp_network'
    | 'status'
    | 'multi_az'
    | 'proxy'
    | 'additional_trust_bundle'
    | 'node_drain_grace_period'
    | 'disable_user_workload_monitoring'
  > & {
    metrics: OneMetric;
    state?: string | ClusterState;
    ['subscription_id']?: string;
    ['activity_timestamp']?: string;
    ['cpu_architecture']?: string;
    product?: Cluster['product'] & { type?: string };
  };

export type ClusterFromSubscription = FakeCluster & {
  subscription?: Subscription;
};

export type ClusterWithPermissions = ClusterFromSubscription & {
  canEdit?: boolean;
  canDelete?: boolean;
  partialCS?: boolean;
};
export type SubscriptionWithPermissions = Subscription & {
  canEdit?: boolean;
};

export type SubscriptionWithPermissionsList = List & {
  items?: Array<SubscriptionWithPermissions>;
};

export type AugmentedCluster = ClusterWithPermissions & {
  canEditOCMRoles?: boolean;
  canViewOCMRoles?: boolean;
  canUpdateClusterResource?: boolean;
  canEditClusterAutoscaler?: boolean;
  idpActions?: {
    [action: string]: boolean;
  };
  machinePoolsActions?: {
    [action: string]: boolean;
  };
  kubeletConfigActions?: {
    [action: string]: boolean;
  };
  upgradeGates?: VersionGateAgreement[];
  aiCluster?: AICluster;
  limitedSupportReasons?: LimitedSupportReason[];
  aiSupportLevels?: FeaturesSupportsLevel;
  status?: ClusterStatus;
  api?: ClusterApi;
};

export type AugmentedClusterResponse = {
  data: AugmentedCluster;
};

export type ErrorDetail = { kind: string; items?: any };

export type ErrorState = {
  pending: boolean;
  fulfilled: false;
  error: true;
  reason?: string;
  errorCode?: number;
  internalErrorCode?: string;
  errorMessage?: string;
  errorDetails?: ErrorDetail[];
  operationID?: string;
  message?: string;
};

export type AWSCredentials = Pick<
  Aws,
  'account_id' | 'access_key_id' | 'secret_access_key' | 'sts'
>;

export type ViewSorting = {
  isAscending: boolean;
  sortField: string;
  sortIndex: number;
};

export type ViewFlags = undefined | null | boolean | string[] | { [key: string]: string[] };

export type UserInfo = {
  username: string;
};

export type ListAPIParams = {
  page: number;
  size: number;
  search?: string;
  fields?: string;
  orderBy?: string;
};

export type ToggleEvent = React.MouseEvent | React.ChangeEvent | React.KeyboardEvent | Event;

export type UpgradePolicyWithState = UpgradePolicy & { state?: UpgradePolicyState };
