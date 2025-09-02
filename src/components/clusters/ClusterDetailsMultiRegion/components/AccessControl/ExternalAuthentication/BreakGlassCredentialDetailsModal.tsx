import React from 'react';

import {
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StackItem,
} from '@patternfly/react-core';

import ErrorBox from '~/components/common/ErrorBox';
import { useFetchBreakGlassCredentialDetails } from '~/queries/ClusterDetailsQueries/AccessControlTab/ExternalAuthenticationQueries/useFetchBreakGlassCredentialDetails';
import { BreakGlassCredential } from '~/types/clusters_mgmt.v1';

const DownloadButton = ({ textOutput, disabled }: { textOutput: string; disabled: boolean }) => {
  const file = new Blob([textOutput], { type: 'text/plain' });

  return (
    <Button
      component="a"
      variant="primary"
      download="kubeConfig.txt"
      target="_blank"
      rel="noreferrer"
      href={URL.createObjectURL(file)}
      isDisabled={disabled}
    >
      Download
    </Button>
  );
};

type BreakGlassCredentialDetailsModalProps = {
  clusterID: string;
  onClose: () => void;
  credential?: BreakGlassCredential;
  isOpen?: boolean;
  region?: string;
};

export function BreakGlassCredentialDetailsModal(props: BreakGlassCredentialDetailsModalProps) {
  const { clusterID, onClose, credential, region, isOpen = true } = props;

  const {
    data: credentialData,
    isLoading,
    isError,
    error,
  } = useFetchBreakGlassCredentialDetails(region, clusterID, credential?.id);

  const statusMessage = () => {
    if (credentialData?.status === 'revoked') {
      return 'Credentials have been revoked.';
    }
    if (credentialData?.status === 'created') {
      return 'Credentials are being created. Try again later.';
    }
    return 'Here are the credentials';
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      onClose={handleClose}
      variant="medium"
      isOpen={isOpen}
      ouiaId="BreakGlassCredentialDetailsModal"
      aria-labelledby="breakglass-credential-details-modal"
      aria-describedby="Use these temporary credentials to access your cluster."
    >
      <ModalHeader
        title={`${credential?.username} credentials`}
        labelId="breakglass-credential-details-modal-id"
      />
      <ModalBody>
        {statusMessage()}
        {isError && (
          <StackItem>
            <ErrorBox
              message="A problem occurred while retrieving credential"
              response={{
                errorMessage: error.error.reason,
                operationID: error.error.operationID,
              }}
            />
          </StackItem>
        )}

        <ClipboardCopy isReadOnly variant={ClipboardCopyVariant.expansion}>
          {isLoading ? 'Loading...' : credentialData?.kubeconfig || 'No kubeconfig'}
        </ClipboardCopy>
      </ModalBody>
      <ModalFooter>
        <DownloadButton
          textOutput={credentialData?.kubeconfig || ''}
          disabled={isLoading || !credentialData?.kubeconfig}
        />
        <Button key="cancel" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
