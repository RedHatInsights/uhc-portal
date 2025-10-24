import React from 'react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import { Button, Form, FormGroup, Stack, StackItem, TextArea } from '@patternfly/react-core';

import ErrorBox from '~/components/common/ErrorBox';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import TextField from '~/components/common/formik/TextField';
import Modal from '~/components/common/Modal/Modal';
import { usePostAccessRequest } from '~/queries/ClusterDetailsQueries/AccessRequestTab/usePostAccessRequest';

type AccessRequestNewModalProps = {
  subscriptionId: string;
  onClose: () => void;
  isModalOpen: boolean;
};

export function AccessRequestNewModal(props: AccessRequestNewModalProps) {
  const { subscriptionId, isModalOpen, onClose } = props;

  const { isPending, isError, error, mutate } = usePostAccessRequest();

  return isModalOpen ? (
    <Formik
      initialValues={{
        internal_support_case_id: '',
        justification: '',
        duration: '8h',
      }}
      validationSchema={Yup.object({
        internal_support_case_id: Yup.string()
          .max(255, 'Must be 255 characters or less')
          .required('Required'),
        justification: Yup.string()
          .max(1000, 'Must be 1000 characters or less')
          .required('Required'),
        duration: Yup.string()
          .matches(/^\d+[hms]$/, 'Must be in format like "8h", "30m" or "15s"')
          .required('Required'),
      })}
      onSubmit={async (values) => {
        const data = {
          subscription_id: subscriptionId,
          internal_support_case_id: values.internal_support_case_id,
          justification: values.justification,
          duration: values.duration,
          deadline: '72h', // Default deadline as specified in API
        };
        mutate(data, {
          onSuccess: () => onClose(),
        });
      }}
    >
      {(formik) => (
        <Modal
          id="add-access-request-modal"
          title="Create access request"
          onClose={onClose}
          modalSize="medium"
          description="Create a new access request for this cluster."
          hideDefaultFooter
          footer={
            <Stack hasGutter>
              {isError && error && (
                <StackItem>
                  <ErrorBox
                    message="A problem occurred while creating access request"
                    response={{
                      errorMessage: error.error.reason,
                      operationID: error.error.operationID,
                    }}
                  />
                </StackItem>
              )}

              <StackItem>
                <Button
                  onClick={formik.submitForm}
                  className="pf-v6-u-mr-md"
                  data-testid="submit-btn"
                  isDisabled={!formik.isValid || !formik.dirty || formik.isSubmitting || isPending}
                  isLoading={isPending}
                >
                  Create
                </Button>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  isDisabled={formik.isSubmitting || isPending}
                >
                  Cancel
                </Button>
              </StackItem>
            </Stack>
          }
        >
          <Form>
            <TextField
              fieldId="internal_support_case_id"
              label="Internal support case ID"
              isRequired
              helpText="The internal support case ID associated with this access request"
            />
            <Field name="justification">
              {({ field, meta }: { field: any; meta: any }) => (
                <FormGroup fieldId="justification" label="Justification" isRequired>
                  <TextArea
                    {...field}
                    id="justification"
                    isRequired
                    aria-label="access request justification"
                    rows={5}
                  />
                  <FormGroupHelperText touched={meta.touched} error={meta.error}>
                    Provide a justification for this access request
                  </FormGroupHelperText>
                </FormGroup>
              )}
            </Field>
            <TextField
              fieldId="duration"
              label="Duration"
              isRequired
              helpText='Duration in hours (e.g., "8h"), minutes (e.g., "30m") or seconds (e.g., "15s")'
              placeHolderText=""
            />
          </Form>
        </Modal>
      )}
    </Formik>
  ) : null;
}
