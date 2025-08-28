import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { Spinner } from '@patternfly/react-core';

import { Navigate } from '~/common/routing';
import { useFetchSubscriptionIdForCluster } from '~/queries/ClusterDetailsQueries/useFetchSubscriptionIdForCluster';
import { setGlobalError } from '~/redux/actions/globalErrorActions';
import { ErrorState } from '~/types/types';

import Unavailable from '../../common/Unavailable';

const ClusterDetailsRedirector = () => {
  const params = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const { subscriptionID, error, isError, isFetched } = useFetchSubscriptionIdForCluster(
    params?.id || '',
  );

  if (isError) {
    return (
      <Unavailable message="Error retrieving cluster details" response={error as ErrorState} />
    );
  }

  if (!isFetched) {
    return (
      <div className="pf-v6-u-text-align-center">
        <Spinner aria-label="Loading..." />
      </div>
    );
  }

  if (!subscriptionID) {
    dispatch(
      setGlobalError(
        `Cluster with ID ${params.id} was not found, it might have been deleted or you don't have permission to see it.`,
        'clusterDetails',
        '',
      ),
    );
    return <Navigate replace to="/cluster-list" />;
  }

  return <Navigate replace to={`/details/s/${subscriptionID}${location.hash}`} />;
};

export default ClusterDetailsRedirector;
