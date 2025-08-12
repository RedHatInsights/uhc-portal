import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ErrorModal from '~/components/common/ErrorModal';
import { resetCreatedClusterResponse } from '~/redux/actions/clustersActions';
import { GlobalState } from '~/redux/state';

import MissingPrereqErrorModal from './MissingPrereqErrorModal';
import ShieldedVmErrorModal from './ShieldedVmErrorModal';

type CreateClusterErrorModalProps = {
  onRetry: () => Promise<void>;
};

const CreateClusterErrorModal = ({ onRetry }: CreateClusterErrorModalProps) => {
  const dispatch = useDispatch();
  const createClusterResponse = useSelector((state: GlobalState) => state.clusters.createdCluster);
  const resetResponse = () => dispatch(resetCreatedClusterResponse());

  const { error: createClusterError } = createClusterResponse;

  if (createClusterError) {
    const errorDetailsKey = (createClusterResponse.errorDetails?.[0] as any)?.Error_Key;
    const isAwsCredsAdminError = errorDetailsKey === 'AWSCredsNotOSDCCSAdmin';

    if (isAwsCredsAdminError) {
      return <MissingPrereqErrorModal onRetry={onRetry} onClose={resetResponse} />;
    }

    if (
      createClusterResponse?.errorMessage &&
      typeof createClusterResponse?.errorMessage === 'string' &&
      createClusterResponse?.errorMessage.includes('SecureBoot feature')
    ) {
      return (
        <ShieldedVmErrorModal
          title="Error creating cluster"
          errorResponse={createClusterResponse}
          resetResponse={resetResponse}
        />
      );
    }

    return (
      <ErrorModal
        title="Error creating cluster"
        errorResponse={createClusterResponse}
        resetResponse={resetResponse}
      />
    );
  }

  return null;
};

export default CreateClusterErrorModal;
