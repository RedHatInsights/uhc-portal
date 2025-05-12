import { useDispatch } from 'react-redux';

import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useMutation } from '@tanstack/react-query';

import { getClusterServiceForRegion } from '~/services/clusterService';

import { formatErrorData } from '../helpers';

import { buildArchiveNotifications } from './useArchiveCluster';

export const useUnArchiveCluster = () => {
  const dispatch = useDispatch();
  const { isSuccess, error, isError, isPending, mutate, reset } = useMutation({
    mutationKey: ['clusterService', 'unarchiveCluster'],
    mutationFn: ({
      subscriptionID,
      displayName,
      region,
    }: {
      subscriptionID: string;
      displayName: string;
      region?: string;
    }) => {
      // unarchiveCluster is actually a call to accounts management
      // so region isn't required

      const clusterService = getClusterServiceForRegion(region);

      return clusterService.unarchiveCluster(subscriptionID).then((response) => {
        // @ts-ignore
        dispatch(addNotification(buildArchiveNotifications(displayName, false)));
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
