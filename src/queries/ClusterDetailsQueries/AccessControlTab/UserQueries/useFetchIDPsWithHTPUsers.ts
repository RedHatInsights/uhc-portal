import get from 'lodash/get';

import { useQuery } from '@tanstack/react-query';

import { queryClient } from '~/components/App/queryClient';
import { formatErrorData, getHtpasswdIds } from '~/queries/helpers';
import { HTPasswdIdpUsers, HTPasswdUser } from '~/queries/types';
import { getClusterServiceForRegion } from '~/services/clusterService';
import { IdentityProvider } from '~/types/clusters_mgmt.v1';

export const refetchIdentityProvidersWithHTPUsers = (clusterID: string, region?: string) => {
  queryClient.invalidateQueries({
    queryKey: ['fetchIDPsWithHTPUsers', clusterID, region],
  });
};

const usersErrors: any = [];

export const useFetchIDPsWithHTPUsers = (clusterID: string, region?: string) => {
  const { isLoading, data, isError, error, isSuccess } = useQuery({
    queryKey: ['fetchIDPsWithHTPUsers', clusterID, region],
    queryFn: async () => {
      const clusterService = getClusterServiceForRegion(region);
      const response = clusterService.getIdentityProviders(clusterID).then(async (res) => {
        const idpItems = get(res.data, 'items', []);

        const htpUsers: HTPasswdIdpUsers[] = [];

        const htPasswdIds = getHtpasswdIds(idpItems);

        // eslint-disable-next-line no-restricted-syntax
        for (const htpId of htPasswdIds) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const response: any = await clusterService.getHtpasswdUsers(clusterID, htpId);

            const users: HTPasswdUser[] = response?.data?.items;

            htpUsers.push({ idpId: htpId, htpUsers: users });
          } catch (error) {
            usersErrors.push({ idpId: htpId, error });
          }
        }

        const mergeHtpUsersToIdp = (idps: IdentityProvider[], htpUsersData: HTPasswdIdpUsers[]) => {
          const mergedIdps = new Map();

          // eslint-disable-next-line no-restricted-syntax
          for (const idp of idps) {
            mergedIdps.set(idp.id, { ...idp });
          }

          // eslint-disable-next-line no-restricted-syntax
          for (const item of htpUsersData) {
            if (mergedIdps.has(item.idpId)) {
              const existingIdp = mergedIdps.get(item.idpId);
              const orderedUsers = item.htpUsers?.reverse();
              mergedIdps.set(item.idpId, { ...existingIdp, htpUsers: orderedUsers });
            }
          }
          return Array.from(mergedIdps.values());
        };

        const mergedIdps = mergeHtpUsersToIdp(idpItems, htpUsers);

        return mergedIdps;
      });

      return response;
    },
    enabled: !!clusterID,
  });

  const formattedError = formatErrorData(isLoading, isError, error);

  return {
    data,
    isLoading,
    isError,
    error: formattedError,
    isSuccess,
  };
};
