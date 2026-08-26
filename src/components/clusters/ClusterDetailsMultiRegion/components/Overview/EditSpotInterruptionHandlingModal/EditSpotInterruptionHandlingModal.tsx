import * as React from 'react';

import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Title,
} from '@patternfly/react-core';

import { validateSpotTerminationHandlerQueueUrl } from '~/common/validators';
import { queryClient } from '~/components/App/queryClient';
import {
  ENHANCED_SPOT_VERSION_DISABLED_REASON,
  SpotInterruptionMode,
} from '~/components/clusters/common/SpotInterruptionHandling/spotInterruptionHandlingConstants';
import { SpotInterruptionHandlingFields } from '~/components/clusters/common/SpotInterruptionHandling/SpotInterruptionHandlingFields';
import ErrorBox from '~/components/common/ErrorBox';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { queryConstants } from '~/queries/queriesConstants';
import { ClusterFromSubscription } from '~/types/types';

type EditSpotInterruptionHandlingModalProps = {
  cluster: ClusterFromSubscription;
  region?: string;
  isEnhancedDisabled?: boolean;
  onClose: () => void;
};

const getTerminationHandlerQueueUrl = (cluster: ClusterFromSubscription): string =>
  cluster?.aws?.termination_handler_queue_url || '';

const EditSpotInterruptionHandlingModal = ({
  cluster,
  region,
  isEnhancedDisabled,
  onClose,
}: EditSpotInterruptionHandlingModalProps) => {
  const clusterRegion = cluster?.region?.id || region;
  const initialQueueUrl = getTerminationHandlerQueueUrl(cluster);
  const initialMode = initialQueueUrl ? SpotInterruptionMode.Enhanced : SpotInterruptionMode.Simple;

  const [mode, setMode] = React.useState<SpotInterruptionMode>(initialMode);
  const [sqsQueueUrl, setSqsQueueUrl] = React.useState(initialQueueUrl);
  const [isTouched, setIsTouched] = React.useState(false);

  const validationError =
    mode === SpotInterruptionMode.Enhanced && (isTouched || !!sqsQueueUrl.trim())
      ? validateSpotTerminationHandlerQueueUrl(sqsQueueUrl, clusterRegion)
      : undefined;

  const hasChanges =
    mode !== initialMode ||
    (mode === SpotInterruptionMode.Enhanced && sqsQueueUrl.trim() !== initialQueueUrl.trim());
  const isValid =
    mode === SpotInterruptionMode.Simple || (!!sqsQueueUrl.trim() && !validationError);

  const { mutate: editCluster, isPending: isSubmitting, isError, error } = useEditCluster(region);

  const handleSave = () => {
    if (!cluster.id) {
      return;
    }

    editCluster(
      {
        clusterID: cluster.id,
        cluster: {
          aws: {
            termination_handler_queue_url:
              mode === SpotInterruptionMode.Enhanced ? sqsQueueUrl.trim() : '',
          },
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
              'clusterService',
              cluster.id,
            ],
          });
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      id="edit-spot-interruption-handling-modal"
      onClose={isSubmitting ? undefined : onClose}
      variant={ModalVariant.medium}
      isOpen
      className="openshift"
    >
      <ModalHeader>
        <Title headingLevel="h1">Spot interruption handling settings</Title>
      </ModalHeader>
      <ModalBody>
        <Form>
          <SpotInterruptionHandlingFields
            mode={mode}
            onModeChange={(nextMode) => {
              setMode(nextMode);
              if (nextMode === SpotInterruptionMode.Simple) {
                setIsTouched(false);
              }
            }}
            sqsQueueUrl={sqsQueueUrl}
            onSqsQueueUrlChange={setSqsQueueUrl}
            onSqsQueueUrlBlur={() => setIsTouched(true)}
            sqsQueueUrlValidated={validationError ? 'error' : 'default'}
            sqsQueueUrlHelperText={validationError}
            isEnhancedDisabled={isEnhancedDisabled}
            enhancedDisabledReason={
              isEnhancedDisabled ? ENHANCED_SPOT_VERSION_DISABLED_REASON : undefined
            }
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        {isError && error ? (
          <ErrorBox message="Error updating spot interruption handling settings" response={error} />
        ) : null}
        <Button
          variant="primary"
          onClick={handleSave}
          isDisabled={!hasChanges || !isValid || isSubmitting}
          isLoading={isSubmitting}
        >
          Save
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditSpotInterruptionHandlingModal;
