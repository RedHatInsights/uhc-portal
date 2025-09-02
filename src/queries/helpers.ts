import axios, { AxiosResponse } from 'axios';

import { isRestrictedEnv } from '~/restrictedEnv';
import { Cluster, Group, IdentityProvider, User } from '~/types/clusters_mgmt.v1';
import { ErrorState } from '~/types/types';

import { AvailableRegionalInstance, RQApiErrorType, SearchRegionalClusterItems } from './types';

export type FormattedErrorData = {
  isLoading: boolean;
  isError: boolean;
  error:
    | ErrorState
    | Pick<ErrorState, 'errorMessage' | 'errorDetails' | 'operationID' | 'errorCode' | 'reason'>
    | null;
};

export const formatErrorData = (
  isLoading: boolean,
  isError: boolean,
  error: (Error | null) | (Error | null)[],
) => {
  if (isError && axios.isAxiosError(error)) {
    const errorData: ErrorState = {
      pending: isLoading,
      error: isError,
      fulfilled: false,
      errorCode: error?.response?.status,
      errorDetails: error?.response?.data?.details,
      errorMessage: `${error?.response?.data.code}: ${error?.response?.data.reason}`,
      reason: `${error?.response?.data.reason}`,
      internalErrorCode: error?.response?.data.code,
      operationID: error?.response?.data.operation_id,
    };
    return {
      isLoading,
      isError,
      error: errorData,
    };
  }

  return {
    isLoading,
    isError,
    error: error as any as Pick<
      ErrorState,
      'errorMessage' | 'errorDetails' | 'operationID' | 'errorCode' | 'reason' | 'message'
    >,
  };
};

export const addNotificationErrorFormat = (
  isLoading: boolean,
  isError: boolean,
  error: (Error | null) | (Error | null)[],
) => {
  if (isError && axios.isAxiosError(error)) {
    const errorData: RQApiErrorType = {};
    errorData.pending = isLoading;
    errorData.error = isError;
    errorData.fulfilled = false;
    errorData.errorCode = error?.response?.status;
    errorData.errorDetails = error?.response?.data?.details;
    errorData.errorMessage = `${error?.response?.data.reason}`;
    errorData.internalErrorCode = error?.response?.data.code;
    errorData.operationID = error?.response?.data.operation_id;
    return {
      isLoading,
      isError,
      error: errorData,
    };
  }
  return undefined;
};

export const formatRegionalInstanceUrl = (regionalInstanceUrl: string) => {
  if (regionalInstanceUrl) {
    return regionalInstanceUrl.replace('api.', '').replace('.openshift.com', '');
  }
  return '';
};

export const createResponseForSearchCluster = (responseItems: Cluster[] | undefined) => {
  const result: SearchRegionalClusterItems = { items: [] };
  if (responseItems) {
    responseItems?.forEach((entry: Cluster) => {
      const cluster = {
        name: entry.name,
        domain_prefix: entry.domain_prefix,
      };
      result.items.push(cluster);
    });
    return result;
  }
  return undefined;
};

export const getFormattedUserData = async (
  response: Promise<
    AxiosResponse<
      {
        items?: Array<Group>;
        page?: number;
        size?: number;
        total?: number;
      },
      any
    >
  >,
) => {
  const data = response.then((res) => {
    const items = res.data.items?.map((g: Group) => {
      const group: any = g;
      if (group.users) {
        group.users.items = group.users?.filter((user: User) => user.id !== 'cluster-admin');
      }
      return group;
    });
    return items || [];
  });
  return data || [];
};

export const defaultRegionalInstances: AvailableRegionalInstance[] = [
  {
    cloud_provider_id: 'aws',
    href: '/api/accounts_mgmt/v1/regions',
    id: '',
    kind: 'Region',
    url: 'https://api.openshift.com',
    environment: 'production',
    isDefault: true,
  },
  {
    cloud_provider_id: 'aws',
    href: '/api/accounts_mgmt/v1/regions',
    id: 'stage',
    kind: 'Region',
    url: 'https://api.stage.openshift.com',
    environment: 'stage',
    isDefault: true,
  },
  {
    cloud_provider_id: 'aws',
    href: '/api/accounts_mgmt/v1/regions',
    id: 'int',
    kind: 'Region',
    url: 'https://api.integration.openshift.com',
    environment: 'integration',
    isDefault: true,
  },
];

export const currentEnvironment = (): string => {
  const restrictedEnv = isRestrictedEnv();
  const url = window.location;
  const urlHost = url.hostname;

  const hasProdFlag = url.search.includes('env=production');
  const hasStagingFlag = url.search.includes('env=staging');
  const isDevHost = urlHost.includes('prod.foo');
  const isStagingHost = urlHost.includes('console.dev');
  const isProdHost = urlHost.includes('console.redhat');
  const isIntegration = restrictedEnv === true;

  const isStaging =
    hasStagingFlag || (isDevHost && !hasProdFlag) || (isStagingHost && !hasProdFlag);

  const isProduction = hasProdFlag || (isProdHost && !hasStagingFlag);

  if (isIntegration) {
    return 'integration';
  }
  if (isStaging) {
    return 'stage';
  }
  if (isProduction) {
    return 'production';
  }

  return 'stage';
};

export const getProdRegionalInstances = (instances: AvailableRegionalInstance[]) => {
  const prodInstances = instances?.filter(
    (regionItem: AvailableRegionalInstance) =>
      !regionItem.id?.includes('stage') &&
      !regionItem.id?.includes('integration') &&
      regionItem?.cloud_provider_id === 'aws',
  );
  return prodInstances;
};

export const findRegionalInstance = (
  selectedRegion: string,
  instances: AvailableRegionalInstance[],
) =>
  instances?.find((instance: AvailableRegionalInstance) =>
    instance?.id?.includes(selectedRegion),
  ) || instances?.find((instance: AvailableRegionalInstance) => instance.isDefault);

export const regionalizedClusterId = (formData: {
  hypershift: string;
  regional_instance: AvailableRegionalInstance;
}) => {
  const isRegionalizedCluster =
    formData?.hypershift === 'true' &&
    formData?.regional_instance?.cloud_provider_id === 'aws' &&
    formData?.regional_instance?.isDefault !== true;

  return isRegionalizedCluster ? formData?.regional_instance?.id : undefined;
};

export const getHtpasswdIds = (idpData: IdentityProvider[]) => {
  const htpasswdIds: string[] = [];
  idpData?.forEach((idp: IdentityProvider) => {
    if (idp.type === 'HTPasswdIdentityProvider' && idp.id) {
      htpasswdIds.push(idp.id);
    }
  });
  return htpasswdIds;
};
