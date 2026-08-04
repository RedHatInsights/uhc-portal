import React from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import type { LogForwardingDestinationKind } from '~/components/clusters/wizards/rosa/LogForwarding/buildClusterLogForwarders';
import ErrorBox from '~/components/common/ErrorBox';
import useAnalytics from '~/hooks/useAnalytics';
import { useDeleteLogForwarder } from '~/queries/ClusterDetailsQueries/useDeleteLogForwarder';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

const destinationLabels: Record<LogForwardingDestinationKind, string> = {
  s3: 'Amazon S3',
  cloudwatch: 'CloudWatch',
};

function DeleteLogForwardingModalBody({
  destinationType,
  forwarder,
}: {
  destinationType: LogForwardingDestinationKind;
  forwarder: LogForwarder;
}) {
  if (destinationType === 's3') {
    const bucketName = forwarder.s3?.bucket_name?.trim() ?? '';
    return (
      <p>
        Deleting <strong>{bucketName}</strong> will stop the stream of cluster logs to Amazon S3. No
        data will be lost from S3, but new logs will not be sent.
      </p>
    );
  }

  const logGroupName = forwarder.cloudwatch?.log_group_name?.trim() ?? '';
  return (
    <p>
      Deleting <strong>{logGroupName}</strong> will stop the stream of cluster logs to CloudWatch.
      No data will be lost from CloudWatch, but new logs will not be sent.
    </p>
  );
}

export type DeleteLogForwardingModalProps = {
  clusterId: string;
  region?: string;
  destinationType: LogForwardingDestinationKind;
  forwarder?: LogForwarder;
  onClose: () => void;
  isOpen: boolean;
};

export function DeleteLogForwardingModal({
  clusterId,
  region,
  destinationType,
  forwarder,
  onClose,
  isOpen,
}: DeleteLogForwardingModalProps) {
  const track = useAnalytics();
  const destinationLabel = destinationLabels[destinationType];

  const { isPending, isError, error, mutate, reset } = useDeleteLogForwarder(clusterId, region);

  React.useEffect(() => {
    if (isOpen) {
      track('Log Forwarding Delete Modal Opened', { destination: destinationType });
    }
  }, [destinationType, isOpen, track]);

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !forwarder?.id) {
    return null;
  }

  return (
    <Modal
      onClose={handleClose}
      isOpen={isOpen}
      variant={ModalVariant.small}
      ouiaId="DeleteLogForwardingModal"
      aria-labelledby="delete-log-forwarding-title"
    >
      <ModalHeader
        title={`Delete ${destinationLabel} configuration`}
        titleIconVariant="danger"
        labelId="delete-log-forwarding-title"
      />
      <ModalBody>
        <DeleteLogForwardingModalBody destinationType={destinationType} forwarder={forwarder} />
        {isError ? (
          <ErrorBox
            message={`Failed to delete ${destinationLabel} configuration`}
            response={{
              errorMessage: error.error.errorMessage,
              operationID: error.error.operationID,
            }}
          />
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          isDisabled={isPending}
          isLoading={isPending}
          onClick={() => {
            mutate(forwarder.id ?? '', {
              onSuccess: () => {
                track('Log Forwarding Destination Deleted', { destination: destinationType });
                handleClose();
              },
            });
          }}
        >
          Delete configuration
        </Button>
        <Button key="cancel" variant="link" onClick={handleClose} isDisabled={isPending}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
