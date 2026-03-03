import React from 'react';
import { useDispatch } from 'react-redux';

import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import getClusterName from '~/common/getClusterName';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import Modal from '~/components/common/Modal/Modal';
import modals from '~/components/common/Modal/modals';
import { useEditConsoleURL } from '~/queries/ClusterActionsQueries/useEditConsoleURL';
import { useGlobalState } from '~/redux/hooks';
import { ClusterWithPermissions } from '~/types/types';

import { checkClusterConsoleURL } from '../../../../common/validators';
import ErrorBox from '../../../common/ErrorBox';
import { closeModal } from '../../../common/Modal/ModalActions';

type EditConsoleURLDialogProps = {
  onClose: () => void;
};

const EditConsoleURLDialog = ({ onClose }: EditConsoleURLDialogProps) => {
  const dispatch = useDispatch();
  const closeURLModal = () => dispatch(closeModal());

  const {
    isSuccess,
    error,
    isError,
    isPending,
    mutate,
    reset: resetResponse,
  } = useEditConsoleURL();

  const modalData = useGlobalState((state) => state.modal.data) as ClusterWithPermissions;
  const clusterID = modalData?.id;
  const subscriptionID = modalData?.subscription?.id;
  // @ts-ignore
  const consoleURL = modalData?.console_url || modalData?.console?.url || '';
  // @ts-ignore
  const shouldDisplayClusterName = modalData?.shouldDisplayClusterName || false;
  const region = modalData?.subscription?.rh_region_id;
  const clusterDisplayName = getClusterName(modalData);

  const [currentConsoleUrl, setCurrentConsoleUrl] = React.useState(consoleURL);

  if (isSuccess) {
    resetResponse();
    closeURLModal();
    onClose();
  }

  const cancelEdit = () => {
    resetResponse();
    closeURLModal();
  };

  const validationMessage = checkClusterConsoleURL(currentConsoleUrl, true);

  const handleSubmit = () => {
    if (!validationMessage) {
      if (!!subscriptionID && !!clusterID) {
        mutate({
          subscriptionID,
          clusterID,
          consoleUrl: currentConsoleUrl,
          region,
        });
      }
    }
  };

  const beenSet = currentConsoleUrl !== consoleURL;
  return (
    <Modal
      data-testid="edit-console-url-dialog"
      title={consoleURL ? 'Edit console URL' : 'Add console URL'}
      secondaryTitle={shouldDisplayClusterName ? clusterDisplayName : undefined}
      onClose={cancelEdit}
      primaryText={consoleURL ? 'Save' : 'Add URL'}
      secondaryText="Cancel"
      onPrimaryClick={handleSubmit}
      onSecondaryClick={cancelEdit}
      isPrimaryDisabled={!!validationMessage || !beenSet}
      isPending={isPending}
    >
      <>
        {isError ? <ErrorBox message="Error changing console URL" response={error || {}} /> : null}
        {!consoleURL && (
          <p>
            Adding a cluster&apos;s web console URL will allow you to&nbsp; launch the web console
            from the OpenShift Cluster Manager.
          </p>
        )}
        <Form
          onSubmit={(e) => {
            handleSubmit();
            e.preventDefault();
          }}
        >
          <FormGroup label="Web console URL" fieldId="edit-console-url-input">
            <TextInput
              type="text"
              validated={(beenSet ? !validationMessage : true) ? 'default' : 'error'}
              value={currentConsoleUrl}
              placeholder="https://console-openshift-console.apps.mycluster.example.com/"
              onChange={(_event, newValue) => setCurrentConsoleUrl(newValue)}
              aria-label="Web console URL"
              id="edit-console-url-input"
            />

            <FormGroupHelperText touched={beenSet} error={validationMessage} />
          </FormGroup>
        </Form>
      </>
    </Modal>
  );
};

EditConsoleURLDialog.modalName = modals.EDIT_CONSOLE_URL;

export default EditConsoleURLDialog;
