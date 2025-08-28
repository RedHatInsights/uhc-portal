import { AxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';

import { BulkDeleteHtpasswdUserError } from '~/queries/types';
import { getClusterServiceForRegion } from '~/services/clusterService';
import { HtPasswdUser } from '~/types/clusters_mgmt.v1';

let failedDeletions: BulkDeleteHtpasswdUserError[] = [];

export const useBulkDeleteHtpasswdUser = (clusterID: string, idpId: string, region?: string) => {
  const { isPending, mutate, reset } = useMutation({
    mutationKey: ['bulkDeleteHtpasswdUser'],
    mutationFn: async (htpasswdUsers: HtPasswdUser[]) => {
      const clusterService = getClusterServiceForRegion(region);
      // eslint-disable-next-line no-restricted-syntax
      for (const user of htpasswdUsers) {
        if (user?.id) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await clusterService.deleteHtpasswdUser(clusterID, idpId, user.id);
          } catch (err) {
            const axiosError = err as AxiosError;
            const error = axiosError?.response?.data as any;
            const errorMessage = error?.reason;
            const operationID = error?.operation_id;

            failedDeletions.push({
              username: user.username,
              error: {
                errorMessage,
                operationID,
              },
            });
          }
        }
      }
    },
  });

  return {
    isPending,
    mutate,
    reset: () => {
      failedDeletions = [];
      reset();
    },
    failedDeletions,
  };
};
