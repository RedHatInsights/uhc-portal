import React from 'react';

import { ClusterAutoScalingForm } from '~/components/clusters/common/clusterAutoScalingValues';
import { Subscription } from '~/types/accounts_mgmt.v1';
import { Ingress, MachineType } from '~/types/clusters_mgmt.v1';
import { ErrorDetail, ErrorState } from '~/types/types';

export type SubscriptionResponseType = {
  subscription: Subscription;
  isAROCluster: boolean;
  isROSACluster: boolean;
  isOSDCluster: boolean;
};

export type RQApiErrorType = {
  pending?: boolean;
  fulfilled?: false;
  error?: true;
  errorCode?: number;
  internalErrorCode?: string;
  operationID?: string;
  errorMessage?: string | React.ReactElement;
  errorDetails?: ErrorDetail[];
};

export type MutationFormattedErrorType = {
  isLoading: boolean;
  isError: boolean;
  error: Pick<ErrorState, 'errorMessage' | 'errorDetails' | 'operationID' | 'errorCode' | 'reason'>;
};

export type MachineTypesResponse = {
  types?: {
    [id: string]: MachineType[];
  };
  typesByID?: {
    [id: string]: MachineType;
  };
};

export type ClusterAutoscalerResponseType = {
  hasAutoscaler: boolean;
  data: ClusterAutoScalingForm;
};

export type IngresResponseType = {
  /**
   * Retrieved list of ingresses.
   */
  items?: Array<Ingress>;
  /**
   * Index of the requested page, where one corresponds to the first page.
   */
  page?: number;
  /**
   * Number of items contained in the returned page.
   */
  size?: number;
  /**
   * Total number of items of the collection.
   */
  total?: number;
};

export type SearchRegionalCluster = {
  name?: string;
  domain_prefix?: string;
};

export type SearchRegionalClusterItems = {
  items: SearchRegionalCluster[];
};

export type RegionalizedCloudRegion = {
  id?: string;
  display_name?: string;
  enabled?: boolean;
  supports_multi_az?: boolean;
  kms_location_id?: string;
  ccs_only?: boolean;
  supports_hypershift?: boolean;
  is_regionalized?: boolean;
};

export type AvailableRegionalInstance = {
  cloud_provider_id?: string;
  href?: string;
  id?: string;
  kind?: string;
  url?: string;
  environment?: string;
  isDefault?: boolean;
};

export type HTPasswdUser = {
  id?: string;
  username?: string;
  kind?: string;
  href?: string;
};

export type HTPasswdIdpUsers = {
  idpId: string;
  htpUsers: HTPasswdUser[];
};

export type BulkDeleteHtpasswdUserError = {
  username?: string;
  error: { errorMessage?: string; operationID?: string };
};
