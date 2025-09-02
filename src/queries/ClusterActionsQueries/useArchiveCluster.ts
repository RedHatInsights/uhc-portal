import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';
import { useMutation } from '@tanstack/react-query';

import { getClusterServiceForRegion } from '~/services/clusterService';

import { formatErrorData } from '../helpers';

export const buildArchiveNotifications = (name: string, archived: boolean) => ({
  variant: 'success',
  title: `Cluster ${name} has been ${archived ? 'archived' : 'unarchived'}`,
  dismissDelay: 8000,
  dismissable: false,
});

export const useArchiveCluster = () => {
  const addNotification = useAddNotification();
  const { isSuccess, error, isError, isPending, mutate, reset } = useMutation({
    mutationKey: ['clusterService', 'archiveCluster'],
    mutationFn: ({
      subscriptionID,
      displayName,
      region,
    }: {
      subscriptionID: string;
      displayName: string;
      region?: string;
    }) => {
      // archiveCluster is actually a call to accounts management
      // so region isn't required

      const clusterService = getClusterServiceForRegion(region);

      return clusterService.archiveCluster(subscriptionID).then((response) => {
        // @ts-ignore
        addNotification(buildArchiveNotifications(displayName, true));
        return response;
      });
    },
  });

  return {
    isSuccess,
    error: isError && error ? formatErrorData(isPending, isError, error)?.error : null,
    isError,
    isPending,
    mutate,
    reset,
  };
};
