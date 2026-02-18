import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { Stack, StackItem } from '@patternfly/react-core';

import ErrorBox from '~/components/common/ErrorBox';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { refetchAccessRequests } from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessRequests';
import { refetchPendingAccessRequests } from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchPendingAccessRequests';
import {
  useCanMakeDecision,
  usePostAccessRequestDecision,
} from '~/queries/ClusterDetailsQueries/AccessRequestTab/usePostAccessRequestDecision';
import { useGlobalState } from '~/redux/hooks';
import {
  AccessRequest,
  AccessRequestStatusState,
  DecisionDecision,
} from '~/types/access_transparency.v1';

import { AccessRequestFieldId } from '../model/AccessRequestFieldId';

import AccessRequestDetails from './AccessRequestDetails';
import AccessRequestEdit from './AccessRequestEdit';
import AccessRequestStateIcon from './AccessRequestStateIcon';

const AccessRequestModalForm = () => {
  const dispatch = useDispatch();

  const { accessRequest, onClose } = useGlobalState((state) => state.modal.data) as {
    accessRequest?: AccessRequest;
    onClose: () => void;
  };
  const organizationId = useGlobalState((state) => state.userProfile?.organization?.details?.id);

  const [isLoading, setIsLoading] = useState(true);

  const isEditMode = useMemo(
    () => accessRequest?.status?.state === AccessRequestStatusState.Pending,
    [accessRequest],
  );

  const {
    mutate: postAccessRequestDecision,
    isPending: isPostAccessRequestDecisionPending,
    isError: isPostAccessRequestDecisionError,
    error: postAccessRequestDecisionError,
    isSuccess: isPostAccessRequestDecisionSuccess,
  } = usePostAccessRequestDecision(accessRequest?.id!!);

  const {
    data: canMakeDecision,
    isLoading: isCanMakeDecisionLoading,
    isError: isCanMakeDecisionError,
    error: canMakeDecisionError,
  } = useCanMakeDecision(accessRequest?.subscription_id!!, organizationId!!, isEditMode);

  const handleClose = useCallback(() => {
    dispatch(closeModal());
    onClose();
  }, [dispatch, onClose]);

  useEffect(
    () =>
      setIsLoading(
        !accessRequest?.id || isCanMakeDecisionLoading || isPostAccessRequestDecisionPending,
      ),
    [setIsLoading, accessRequest?.id, isCanMakeDecisionLoading, isPostAccessRequestDecisionPending],
  );

  useEffect(() => {
    if (isPostAccessRequestDecisionSuccess) {
      handleClose();
    }
  }, [handleClose, isPostAccessRequestDecisionSuccess]);

  return accessRequest ? (
    <Formik
      initialValues={{
        [AccessRequestFieldId.State]: accessRequest.status?.state,
        [AccessRequestFieldId.Justification]: '',
      }}
      validationSchema={Yup.object({
        [AccessRequestFieldId.State]: Yup.string().required('Required'),
        [AccessRequestFieldId.Justification]: Yup.string()
          .trim()
          .matches(
            /^[a-zA-Z0-9-\s.&,;':_!"/$]+$/,
            'Only alphanumeric characters and punctuation marks are allowed',
          )
          .max(256, 'Must be 256 characters or less')
          .when([AccessRequestFieldId.State], {
            is: AccessRequestStatusState.Denied,
            then: (schema) => schema.required('The justification is required in case of denial.'),
          }),
      })}
      onSubmit={async (values) => {
        const decision = values[AccessRequestFieldId.State];
        postAccessRequestDecision(
          {
            decision: decision as any as DecisionDecision,
            justification:
              decision === AccessRequestStatusState.Denied
                ? values[AccessRequestFieldId.Justification]
                : undefined,
          },
          {
            onSuccess: () => {
              refetchAccessRequests();
              refetchPendingAccessRequests();
            },
          },
        );
      }}
    >
      {(formik) => (
        <Modal
          title={
            <>
              Access Request Details <AccessRequestStateIcon accessRequest={accessRequest} />
            </>
          }
          onClose={handleClose}
          primaryText="Save"
          showPrimary={isEditMode}
          secondaryText={isEditMode ? 'Cancel' : 'Close'}
          onPrimaryClick={formik.handleSubmit}
          onSecondaryClick={handleClose}
          isPrimaryDisabled={
            isEditMode && (!formik.isValid || !formik.dirty || formik.isSubmitting)
          }
          id="access-request-modal"
          isPending={isLoading}
          footer={
            !isPostAccessRequestDecisionError && !isCanMakeDecisionError ? null : (
              <>
                {isPostAccessRequestDecisionError ? (
                  <Stack hasGutter>
                    <StackItem>
                      <ErrorBox
                        message="A problem occurred while saving access request"
                        response={{
                          errorMessage: postAccessRequestDecisionError?.error.errorMessage,
                          errorDetails: postAccessRequestDecisionError?.error.errorDetails,
                        }}
                      />
                    </StackItem>
                  </Stack>
                ) : null}
                {isCanMakeDecisionError ? (
                  <Stack hasGutter>
                    <StackItem>
                      <ErrorBox
                        message="A problem occurred while retrieving rights for making a decision"
                        response={{
                          errorMessage: canMakeDecisionError?.error.errorMessage,
                          errorDetails: canMakeDecisionError?.error.errorDetails,
                        }}
                      />
                    </StackItem>
                  </Stack>
                ) : null}
              </>
            )
          }
        >
          {isEditMode && !isPostAccessRequestDecisionError ? (
            <AccessRequestEdit
              accessRequest={accessRequest}
              userDecisionRights={canMakeDecision?.allowed}
            />
          ) : (
            <AccessRequestDetails accessRequest={accessRequest} />
          )}
        </Modal>
      )}
    </Formik>
  ) : null;
};
AccessRequestModalForm.modalName = modals.ACCESS_REQUEST_DETAILS;

export default AccessRequestModalForm;
