import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Button, Form, Stack, StackItem } from '@patternfly/react-core';

import ErrorBox from '~/components/common/ErrorBox';
import { NumberInputField } from '~/components/common/formik/NumberInputField';
import TextField from '~/components/common/formik/TextField';
import Modal from '~/components/common/Modal/Modal';
import { usePostBreakGlassCredentials } from '~/queries/ClusterDetailsQueries/AccessControlTab/ExternalAuthenticationQueries/usePostBreakGlassCredentials';

type BreakGlassCredentialNewModalProps = {
  clusterId: string;
  credentialList?: string[];
  onClose: () => void;
  isNewModalOpen: boolean;
  region?: string;
};

export function BreakGlassCredentialNewModal(props: BreakGlassCredentialNewModalProps) {
  const { clusterId, isNewModalOpen, onClose, credentialList, region } = props;

  const { isPending, isError, error, mutate, reset } = usePostBreakGlassCredentials(
    region,
    clusterId,
  );

  const addNHoursToCurrentTime = (hours: number): string => {
    const today = new Date();
    return new Date(today.setHours(today.getHours() + hours)).toISOString();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return isNewModalOpen ? (
    <Formik
      initialValues={{
        username: '',
        expiration: 1,
      }}
      validationSchema={Yup.object({
        username: Yup.string()
          .matches(/^[a-zA-Z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed')
          .max(64, 'Must be 64 characters or less')
          .required('Required')
          .notOneOf(credentialList || [], 'Username already exists'),
        expiration: Yup.number()
          .integer('Only integer numbers allowed')
          .min(1)
          .max(24)
          .test('is-integer', 'expiration must be an integer', (value) => Number.isInteger(value)),
      })}
      onSubmit={async (values) => {
        const data = {
          username: values.username,
          expiration_timestamp: addNHoursToCurrentTime(values.expiration || 1),
        };
        mutate(data, {
          onSuccess: () => onClose(),
        });
      }}
    >
      {(formik) => (
        <Modal
          id="add-break-glass-credential-modal"
          title="Add break glass credential"
          onClose={handleClose}
          modalSize="small"
          description="Add a break glass credential to access the cluster."
          hideDefaultFooter
          footer={
            <Stack hasGutter>
              {isError && (
                <StackItem>
                  <ErrorBox
                    message="A problem occurred while adding credential"
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
                  Add
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
            <TextField fieldId="username" label="Username" isRequired />
            <NumberInputField
              fieldId="expiration"
              label="Hours until credentials expire"
              isRequired
              min={1}
              max={24}
              helpText="Expiration time will be 1 - 24 hours from now."
            />
          </Form>
        </Modal>
      )}
    </Formik>
  ) : null;
}
