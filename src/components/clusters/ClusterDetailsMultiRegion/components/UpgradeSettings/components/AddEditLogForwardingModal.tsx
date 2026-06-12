import React from 'react';
import { Formik } from 'formik';

import { Button, Form, Stack, StackItem } from '@patternfly/react-core';

import {
  buildSingleLogForwarder,
  logForwarderToFormValues,
  type LogForwardingDestinationKind,
} from '~/components/clusters/wizards/rosa/LogForwarding/buildClusterLogForwarders';
import { createCloudWatchLogGroupName } from '~/components/clusters/wizards/rosa/LogForwarding/logForwardingNaming';
import {
  type LogForwardingModalFormValues,
  validateLogForwardingModalFields,
} from '~/components/clusters/wizards/rosa/LogForwarding/logForwardingValidation';
import ErrorBox from '~/components/common/ErrorBox';
import type { LogForwardingGroupTreeNode } from '~/components/common/GroupsApplicationsSelector/logForwardingGroupTreeData';
import Modal from '~/components/common/Modal/Modal';
import useAnalytics from '~/hooks/useAnalytics';
import { useCreateLogForwarder } from '~/queries/ClusterDetailsQueries/useCreateLogForwarder';
import { useEditLogForwarder } from '~/queries/ClusterDetailsQueries/useEditLogForwarder';
import type { LogForwarder } from '~/types/clusters_mgmt.v1';

import { LogForwardingCloudWatchFormFields } from './LogForwardingCloudWatchFormFields';
import { LogForwardingS3FormFields } from './LogForwardingS3FormFields';

export type AddEditLogForwardingModalProps = {
  clusterId: string;
  region?: string;
  destinationType: LogForwardingDestinationKind;
  mode: 'add' | 'edit';
  forwarder?: LogForwarder;
  catalogTree: LogForwardingGroupTreeNode[];
  clusterName?: string;
  onClose: () => void;
  isOpen: boolean;
};

const destinationLabels: Record<LogForwardingDestinationKind, string> = {
  s3: 'Amazon S3',
  cloudwatch: 'CloudWatch',
};

const EMPTY_CATALOG_TREE: LogForwardingGroupTreeNode[] = [];

export function AddEditLogForwardingModal({
  clusterId,
  region,
  destinationType,
  mode,
  forwarder,
  catalogTree,
  clusterName = '',
  onClose,
  isOpen,
}: AddEditLogForwardingModalProps) {
  const track = useAnalytics();
  const destinationLabel = destinationLabels[destinationType];
  const isEdit = mode === 'edit';

  const {
    isPending: isPostPending,
    isError: isPostError,
    error: postError,
    mutate: postForwarder,
    reset: resetPost,
  } = useCreateLogForwarder(clusterId, region);

  const {
    isPending: isPatchPending,
    isError: isPatchError,
    error: patchError,
    mutate: patchForwarder,
    reset: resetPatch,
  } = useEditLogForwarder(clusterId, region);

  const isPending = isPostPending || isPatchPending;
  const isError = isPostError || isPatchError;
  const mutationError = isPostError ? postError : patchError;

  React.useEffect(() => {
    if (isOpen) {
      track('Log Forwarding Edit Modal Opened', { destination: destinationType, mode });
    }
  }, [destinationType, isOpen, mode, track]);

  const handleClose = () => {
    resetPost();
    resetPatch();
    onClose();
  };

  const catalogTreeForInitialValues = isEdit ? catalogTree : EMPTY_CATALOG_TREE;

  const initialValues = React.useMemo((): LogForwardingModalFormValues => {
    if (isEdit && forwarder) {
      return {
        ...logForwarderToFormValues(destinationType, forwarder, catalogTreeForInitialValues),
        prerequisiteAck: true,
      };
    }

    return {
      bucketName: '',
      bucketPrefix: '',
      logGroupName:
        destinationType === 'cloudwatch' ? createCloudWatchLogGroupName(clusterName) : '',
      roleArn: '',
      selectedItems: [],
      prerequisiteAck: false,
    };
  }, [destinationType, clusterName, forwarder, catalogTreeForInitialValues, isEdit]);

  if (!isOpen) {
    return null;
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={isEdit}
      validate={(values) =>
        validateLogForwardingModalFields(destinationType, values, {
          requireCloudWatchPrerequisite: destinationType === 'cloudwatch' && !isEdit,
        })
      }
      onSubmit={(values) => {
        const body = buildSingleLogForwarder(destinationType, values, catalogTree);
        if (!body) {
          return;
        }

        const onSuccess = () => {
          track('Log Forwarding Configured', {
            context: 'cluster_settings',
            destination: destinationType,
          });
          handleClose();
        };

        if (isEdit && forwarder?.id) {
          patchForwarder({ logForwarderID: forwarder.id, body }, { onSuccess });
          return;
        }

        postForwarder(body, { onSuccess });
      }}
    >
      {(formik) => (
        <Modal
          id={`${mode}-log-forwarding-${destinationType}-modal`}
          title={`${isEdit ? 'Edit' : 'Add'} ${destinationLabel} configuration`}
          onClose={handleClose}
          modalSize="large"
          hideDefaultFooter
          footer={
            <Stack hasGutter>
              {isError && mutationError ? (
                <StackItem>
                  <ErrorBox
                    message={`A problem occurred while ${isEdit ? 'updating' : 'adding'} the configuration`}
                    response={{
                      errorMessage: mutationError!.error.errorMessage,
                      operationID: mutationError!.error.operationID,
                    }}
                  />
                </StackItem>
              ) : null}
              <StackItem>
                <Button
                  onClick={formik.submitForm}
                  className="pf-v6-u-mr-md"
                  data-testid="log-forwarding-submit-btn"
                  isDisabled={!formik.isValid || formik.isSubmitting || isPending}
                  isLoading={isPending}
                >
                  {isEdit ? 'Save' : 'Add'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  isDisabled={formik.isSubmitting || isPending}
                >
                  Cancel
                </Button>
              </StackItem>
            </Stack>
          }
        >
          <Form>
            {destinationType === 's3' ? (
              <LogForwardingS3FormFields />
            ) : (
              <LogForwardingCloudWatchFormFields showPrerequisites={!isEdit} />
            )}
          </Form>
        </Modal>
      )}
    </Formik>
  );
}
