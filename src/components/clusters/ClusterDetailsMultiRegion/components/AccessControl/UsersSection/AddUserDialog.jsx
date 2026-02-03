import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Form, FormGroup, Radio, TextInput } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import Modal from '~/components/common/Modal/Modal';
import { refetchUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchUsers';

import links from '../../../../../../common/installLinks.mjs';
import { checkUserID } from '../../../../../../common/validators';
import ErrorBox from '../../../../../common/ErrorBox';
import ExternalLink from '../../../../../common/ExternalLink';
import { modalActions } from '../../../../../common/Modal/ModalActions';

const AddUserDialog = ({
  isOpen,
  canAddClusterAdmin,
  addUserMutate,
  isAddUserPending,
  isAddUserError,
  addUserError,
  isAddUserSuccess,
  resetAddUserMutate,
  isROSA,
  isHypershift,
}) => {
  const dispatch = useDispatch();

  const [selectedGroup, setSelectedGroup] = React.useState('dedicated-admins');
  const [userId, setUserId] = React.useState('');
  const [userIdTouched, setUserIdTouched] = React.useState(false);

  const iamOperatorRolesLink = isHypershift
    ? links.ROSA_AWS_IAM_OPERATOR_ROLES
    : links.ROSA_CLASSIC_AWS_IAM_OPERATOR_ROLES;

  const resetInitialState = () => {
    setSelectedGroup('dedicated-admins');
    setUserId('');
    setUserIdTouched(false);
  };

  React.useEffect(() => {
    if (isAddUserSuccess) {
      dispatch(modalActions.closeModal());
      resetInitialState();
    }
  }, [isAddUserSuccess, dispatch]);

  const setUserIdValue = (userIdValue) => {
    setUserId(userIdValue);
    setUserIdTouched(true);
  };

  const setGroupValue = (_, event) => {
    setSelectedGroup(event.target.value);
  };

  const cancelAddUser = () => {
    resetInitialState();
    resetAddUserMutate();
    dispatch(modalActions.closeModal());
  };

  const hasError = isAddUserError && (
    <ErrorBox message="Error adding grant" response={addUserError.error} />
  );
  const validationMessage = checkUserID(userId);

  const handleSubmit = () => {
    if (!validationMessage && !!selectedGroup) {
      addUserMutate(
        { selectedGroup, userId },
        {
          onSuccess: () => refetchUsers(),
        },
      );
    }
  };

  const dedicatedAdmin = 'dedicated-admins';
  const clusterAdmin = 'cluster-admins';

  return (
    isOpen && (
      <Modal
        title="Add cluster user"
        onClose={cancelAddUser}
        primaryText="Add user"
        secondaryText="Cancel"
        onPrimaryClick={handleSubmit}
        onSecondaryClick={cancelAddUser}
        isPrimaryDisabled={!!validationMessage || isAddUserPending}
        isPending={isAddUserPending}
      >
        <>
          {hasError}
          <Form
            className="control-form-cursor"
            onSubmit={(e) => {
              handleSubmit();
              e.preventDefault();
            }}
          >
            <FormGroup label="User ID" isRequired fieldId="user-id">
              <TextInput
                value={userId}
                isRequired
                id="user-id"
                type="text"
                validated={(userIdTouched ? !validationMessage : true) ? 'default' : 'error'}
                onChange={(_event, userIdValue) => setUserIdValue(userIdValue)}
                aria-label="user id"
              />

              <FormGroupHelperText touched={userIdTouched} error={validationMessage} />
            </FormGroup>
            <h3 id="user-group-select">Group</h3>
            <Radio
              className="radio-button"
              key={dedicatedAdmin}
              isChecked={selectedGroup === dedicatedAdmin}
              name={dedicatedAdmin}
              onChange={(event, _) => setGroupValue(_, event)}
              label={
                <>
                  {dedicatedAdmin}
                  <div className="radio-helptext">
                    Grants standard administrative privileges for OpenShift{' '}
                    {isROSA ? 'Service on AWS' : 'Dedicated'}. Users can perform administrative
                    actions listed in the{' '}
                    <ExternalLink
                      href={isROSA ? iamOperatorRolesLink : links.OSD_DEDICATED_ADMIN_ROLE}
                    >
                      documentation
                    </ExternalLink>
                    .
                  </div>
                </>
              }
              id={dedicatedAdmin}
              value={dedicatedAdmin}
            />
            {canAddClusterAdmin && (
              <Radio
                className="radio-button"
                key={clusterAdmin}
                isChecked={selectedGroup === clusterAdmin}
                name={clusterAdmin}
                onChange={(event, _) => setGroupValue(_, event)}
                label={
                  <>
                    {clusterAdmin}
                    <div className="radio-helptext">
                      {' '}
                      Gives users full administrative access to the cluster. This is the highest
                      level of privilege available to users. It should be granted with extreme care,
                      because it is possible with this level of access to get the cluster into an
                      unsupportable state.
                    </div>
                  </>
                }
                id={clusterAdmin}
                value={clusterAdmin}
              />
            )}
          </Form>
        </>
      </Modal>
    )
  );
};

AddUserDialog.propTypes = {
  isOpen: PropTypes.bool,
  canAddClusterAdmin: PropTypes.bool.isRequired,
  addUserMutate: PropTypes.func.isRequired,
  resetAddUserMutate: PropTypes.func.isRequired,
  isAddUserPending: PropTypes.bool.isRequired,
  isAddUserError: PropTypes.bool.isRequired,
  addUserError: PropTypes.object,
  isAddUserSuccess: PropTypes.bool.isRequired,
  isROSA: PropTypes.bool.isRequired,
  isHypershift: PropTypes.bool.isRequired,
};

AddUserDialog.defaultProps = {
  isOpen: false,
};

export default AddUserDialog;
