import React from 'react';
import { useDispatch } from 'react-redux';

import {
  DropEvent,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import docLinks from '~/common/docLinks.mjs';
import ErrorBox from '~/components/common/ErrorBox';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useImportHtpasswdUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useImportHtpasswdUsers';
import { useGlobalState } from '~/redux/hooks';

import { ParsedHTPasswdUser, parseHTPasswdFile } from '../ProvidersForms/htpasswdFileParser';

const UploadHTPasswdFileModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const { idpName, clusterId, idpId, region } = useGlobalState((state) => state.modal.data) as {
    idpName: string;
    clusterId: string;
    idpId: string;
    region: string;
  };

  const dispatch = useDispatch();
  const addNotification = useAddNotification();

  const { isPending, isError, error, isSuccess, reset, mutate } = useImportHtpasswdUsers(
    clusterId,
    idpId,
    region,
  );

  const [filename, setFilename] = React.useState('');
  const [parseErrors, setParseErrors] = React.useState<string[]>([]);
  const [parsedUsers, setParsedUsers] = React.useState<ParsedHTPasswdUser[]>([]);

  const closeUploadModal = React.useCallback(() => {
    reset();
    dispatch(closeModal());
  }, [dispatch, reset]);

  React.useEffect(() => {
    if (isSuccess) {
      onSuccess();
      closeUploadModal();
      addNotification({
        variant: 'success',
        title: `Successfully imported ${parsedUsers.length} user${parsedUsers.length > 1 ? 's' : ''}`,
        dismissable: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeUploadModal, isSuccess, onSuccess]);

  const processContent = (content: string) => {
    const result = parseHTPasswdFile(content);
    setParseErrors(result.errors);
    setParsedUsers(result.errors.length === 0 ? result.users : []);
  };

  const onFileInputChange = (_event: DropEvent, file: File) => {
    setFilename(file.name);
  };

  const onDataChange = (_event: DropEvent, content: string) => {
    if (isError) {
      reset();
    }
    processContent(content);
  };

  const onClearClick = () => {
    setFilename('');
    setParseErrors([]);
    setParsedUsers([]);
  };

  const handleUpload = () => {
    mutate(
      parsedUsers.map((user) => ({
        username: user.username,
        hashed_password: user.password,
      })),
    );
  };

  const isUploadDisabled = parsedUsers.length === 0 || parseErrors.length > 0;

  return (
    <Modal
      title="Upload htpasswd file"
      secondaryTitle={undefined}
      onClose={closeUploadModal}
      primaryText="Upload"
      onPrimaryClick={handleUpload}
      isPending={isPending}
      onSecondaryClick={closeUploadModal}
      isPrimaryDisabled={isUploadDisabled}
    >
      <Form>
        <p>
          Upload a valid htpasswd file to add users to identity provider <strong>{idpName}</strong>.
          Generally, this file is prepared using the{' '}
          <a href={docLinks.IDP_HTPASSWD_UTILITY} target="_blank" rel="noreferrer">
            htpasswd
          </a>{' '}
          tool. Each line must contain a username and a hashed password. If any user fails to be
          created for any reason, the entire import is cancelled — no users will be added.
        </p>

        {isError ? (
          <ErrorBox
            message="A problem occurred while importing htpasswd users"
            response={{
              errorMessage: error?.errorMessage,
              operationID: error?.operationID,
            }}
          />
        ) : null}

        <FormGroup label="htpasswd file" fieldId="htpasswd-file-upload-modal">
          <FileUpload
            id="htpasswd-file-upload-modal"
            type="text"
            filename={filename}
            onDataChange={onDataChange}
            onFileInputChange={onFileInputChange}
            onClearClick={onClearClick}
            isDisabled={isPending}
            hideDefaultPreview
            browseButtonText="Browse"
            validated={parseErrors.length > 0 ? 'error' : 'default'}
            filenamePlaceholder="Upload an htpasswd file or drag and drop"
          />

          {parseErrors.length > 0 && (
            <FormHelperText>
              <HelperText>
                {parseErrors.map((err) => (
                  <HelperTextItem key={err} variant="error">
                    {err}
                  </HelperTextItem>
                ))}
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      </Form>
    </Modal>
  );
};

UploadHTPasswdFileModal.modalName = modals.UPLOAD_HTPASSWD_FILE;

export default UploadHTPasswdFileModal;
