import React from 'react';

import {
  Button,
  Flex,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';

import ErrorBox from '~/components/common/ErrorBox';
import { useDeleteExternalAuth } from '~/queries/ClusterDetailsQueries/AccessControlTab/ExternalAuthenticationQueries/useDeleteExternalAuth';
import { refetchExternalAuths } from '~/queries/ClusterDetailsQueries/AccessControlTab/ExternalAuthenticationQueries/useFetchExternalAuths';
import { ExternalAuth } from '~/types/clusters_mgmt.v1';

type DeleteExternalAuthProviderModalProps = {
  clusterId: string;
  externalAuthProvider: ExternalAuth | undefined;
  onClose: () => void;
  isOpen?: boolean;
  region?: string;
};

export const DeleteExternalAuthProviderModal = (props: DeleteExternalAuthProviderModalProps) => {
  const { clusterId, externalAuthProvider, onClose, isOpen = true, region } = props;
  const [providerNameInput, setProviderNameInput] = React.useState('');

  const {
    isPending,
    isError,
    error,
    mutate: deleteExternalAuthProvider,
    reset,
  } = useDeleteExternalAuth(region, clusterId);

  const closeDialog = () => {
    setProviderNameInput('');
    reset();
    onClose();
  };

  const isValid = providerNameInput === externalAuthProvider?.id;
  const submitForm = (e: any) => {
    e.preventDefault();
    if (isValid) {
      deleteExternalAuthProvider(providerNameInput);
    }
  };

  return (
    <Modal
      onClose={closeDialog}
      isOpen={isOpen}
      ouiaId="DeleteExternalAuthProviderModal"
      aria-labelledby="delete-external-auth-provider"
    >
      <ModalHeader
        title={`Delete provider: ${externalAuthProvider?.id}`}
        labelId="delete-external-auth-provider-title"
      />
      <ModalBody>
        <Flex direction={{ default: 'column' }}>
          <p>
            This action cannot be undone. It will permanently remove the external authentication
            provider {externalAuthProvider?.id}.
          </p>
          <p>
            Confirm deletion by typing <strong>{externalAuthProvider?.id}</strong> below:
          </p>
          <Form onSubmit={submitForm}>
            <TextInput
              type="text"
              value={providerNameInput}
              placeholder="Enter name"
              onChange={(_event, newInput) => setProviderNameInput(newInput)}
              aria-label="provider name to delete"
            />
          </Form>
        </Flex>
        {isError && (
          <Stack hasGutter>
            <StackItem>
              <ErrorBox
                message={`Failed to delete external auth provider: ${externalAuthProvider?.id}`}
                response={{
                  errorMessage: error.error.errorMessage,
                  operationID: error.error.operationID,
                }}
              />
            </StackItem>
          </Stack>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="primary"
          isDisabled={isPending || !isValid}
          isLoading={isPending}
          onClick={() => {
            deleteExternalAuthProvider(externalAuthProvider?.id || '', {
              onSuccess: () => {
                refetchExternalAuths();
                closeDialog();
              },
            });
          }}
        >
          Delete
        </Button>
        <Button key="cancel" variant="secondary" onClick={closeDialog}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
