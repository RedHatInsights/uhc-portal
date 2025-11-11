import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Form, TextInput } from '@patternfly/react-core';

import Modal from '~/components/common/Modal/Modal';
import { refetchClusterAddOns } from '~/queries/ClusterDetailsQueries/AddOnsTab/useFetchClusterAddOns';
import { getOrganizationAndQuota } from '~/redux/actions/userActions';
import { useGlobalState } from '~/redux/hooks';

import ErroBox from '../../../../../common/ErrorBox';
import { closeModal } from '../../../../../common/Modal/ModalActions';
import shouldShowModal from '../../../../../common/Modal/ModalSelectors';
import { setAddonsDrawer } from '../AddOnsActions';

import '../AddOns.scss';

const AddOnsDeleteModal = ({
  deleteClusterAddOn,
  isDeleteClusterAddOnError,
  deleteClusterAddOnError,
  isDeleteClusterAddOnPending,
}) => {
  const dispatch = useDispatch();
  const isOpen = useGlobalState((state) => shouldShowModal(state, 'add-ons-delete-modal'));
  const { addOnName, addOnID, clusterID } = useGlobalState((state) => state.modal.data);
  const [addOnNameInput, setAddOnNameInput] = React.useState('');

  const handleClose = React.useCallback(() => {
    setAddOnNameInput('');
    dispatch(closeModal());
    dispatch(
      setAddonsDrawer({
        open: false,
        activeCard: null,
      }),
    );
  }, [dispatch, setAddOnNameInput]);

  const setValue = (newInput) => {
    setAddOnNameInput(newInput);
  };

  const isValid = addOnNameInput === addOnName;

  const handleSubmit = () => {
    deleteClusterAddOn(
      { clusterID, addOnID },
      {
        onSuccess: () => {
          dispatch(getOrganizationAndQuota());
          refetchClusterAddOns();
          handleClose();
          dispatch(
            setAddonsDrawer({
              open: false,
              activeCard: null,
            }),
          );
        },
      },
    );
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (isValid) {
      handleSubmit();
    }
  };

  const errorContainer = isDeleteClusterAddOnError && (
    <ErroBox message="Error uninstalling add-on" response={deleteClusterAddOnError} />
  );

  const isPending = isDeleteClusterAddOnPending;

  return (
    isOpen && (
      <Modal
        title={`Uninstall ${addOnName}`}
        onClose={handleClose}
        primaryText="Uninstall"
        primaryVariant="danger"
        isPrimaryDisabled={!isValid}
        onPrimaryClick={handleSubmit}
        onSecondaryClick={handleClose}
        isPending={isPending}
      >
        <p>
          {errorContainer}
          This action will uninstall the add-on, removing add-on data from cluster can not be
          undone.
        </p>
        <Form onSubmit={submitForm}>
          <p>
            Confirm deletion by typing{' '}
            <span className="addon-delete-modal-textinput">{addOnName}</span> below:
          </p>
          <TextInput
            type="text"
            value={addOnNameInput}
            placeholder="Enter name"
            onChange={(_event, newInput) => setValue(newInput)}
            aria-label="addon name"
          />
        </Form>
      </Modal>
    )
  );
};

AddOnsDeleteModal.propTypes = {
  isDeleteClusterAddOnError: PropTypes.bool.isRequired,
  isDeleteClusterAddOnPending: PropTypes.bool.isRequired,
  deleteClusterAddOn: PropTypes.func.isRequired,
  deleteClusterAddOnError: PropTypes.object,
};

export default AddOnsDeleteModal;
