import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ErrorModal from '~/components/common/ErrorModal';
import { resetCreatedClusterResponse } from '~/redux/actions/clustersActions';
import { GlobalState } from '~/redux/stateTypes';

const CreateClusterErrorModal = () => {
  const dispatch = useDispatch();
  const createClusterResponse = useSelector((state: GlobalState) => state.clusters.createdCluster);
  const resetResponse = () => dispatch(resetCreatedClusterResponse());

  const { error: createClusterError } = createClusterResponse;

  return createClusterError ? (
    <ErrorModal
      title="Error creating cluster"
      errorResponse={createClusterResponse}
      resetResponse={resetResponse}
    />
  ) : null;
};

export default CreateClusterErrorModal;
