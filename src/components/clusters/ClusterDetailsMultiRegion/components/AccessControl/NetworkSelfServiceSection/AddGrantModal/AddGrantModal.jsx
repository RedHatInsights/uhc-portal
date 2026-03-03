import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Form, FormGroup, Radio, TextInput } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import { validateUserOrGroupARN } from '~/common/validators';
import ErrorBox from '~/components/common/ErrorBox';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import Modal from '~/components/common/Modal/Modal';
import { modalActions } from '~/components/common/Modal/ModalActions';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import PopoverHint from '~/components/common/PopoverHint';
import { refetchGrants } from '~/queries/ClusterDetailsQueries/AccessControlTab/NetworkSelfServiceQueries/useFetchGrants';
import { useGlobalState } from '~/redux/hooks';

import './AddGrantModal.scss';

const AddGrantModal = ({
  addGrantsMutate,
  roles,
  isAddGrantsPending,
  isAddGrantsError,
  addGrantsError,
  resetAddGrantsMutate,
}) => {
  const dispatch = useDispatch();

  const [selectedRole, setSelectedRole] = React.useState('');
  const [arn, setArn] = React.useState('');
  const [arnTouched, setArnTouched] = React.useState(false);

  const hasRoles = !!roles?.length;

  const isOpen = useGlobalState((state) => shouldShowModal(state, 'grant-modal'));

  const resetInitialState = () => {
    setSelectedRole('');
    setArn('');
    setArnTouched(false);
  };

  React.useEffect(() => {
    if (!selectedRole && hasRoles) {
      setSelectedRole(roles[0].id);
    }
  }, [roles, selectedRole, hasRoles]);

  const setArnValue = (arnValue) => {
    setArn(arnValue);
    setArnTouched(true);
  };

  const setRoleValue = (_, event) => {
    setSelectedRole(event.target.value);
  };

  const cancelAddGrant = () => {
    resetAddGrantsMutate();
    resetInitialState();
    dispatch(modalActions.closeModal());
  };

  const hasError = isAddGrantsError && (
    <ErrorBox message="Error adding grant" response={addGrantsError.error} />
  );

  const validationMessage = validateUserOrGroupARN(arn);

  const handleSubmit = async () => {
    if (!validationMessage && !!selectedRole) {
      await addGrantsMutate(
        { roleId: selectedRole, arn },
        {
          onSuccess: () => {
            refetchGrants();
            dispatch(modalActions.closeModal());
            resetInitialState();
          },
        },
      );
    }
  };

  const generateRadio = (role) => (
    <Radio
      className="radio-button"
      key={role.id}
      isChecked={selectedRole === role.id}
      name={role.id}
      onChange={(event, _) => setRoleValue(_, event)}
      label={
        <>
          {role.displayName}
          <div className="radio-helptext">{role.description}</div>
        </>
      }
      id={role.id}
      value={role.id}
    />
  );

  return (
    isOpen && (
      <Modal
        title="Grant AWS infrastructure role"
        onClose={cancelAddGrant}
        primaryText="Grant role"
        secondaryText="Cancel"
        onPrimaryClick={handleSubmit}
        onSecondaryClick={cancelAddGrant}
        isPrimaryDisabled={!!validationMessage}
        isPending={isAddGrantsPending}
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
            <FormGroup
              label="AWS IAM ARN"
              isRequired
              fieldId="aws-iam-arn"
              labelHelp={
                <PopoverHint
                  hint={
                    <div>
                      <p>Need help configuring ARNs?</p>
                      <a
                        href={installLinks.AWS_ARN_CONFIG}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Check the AWS documentation.
                      </a>
                    </div>
                  }
                  iconClassName="hand-pointer"
                />
              }
            >
              <TextInput
                value={arn}
                isRequired
                id="aws-iam-arn-input"
                type="text"
                validated={(arnTouched ? !validationMessage : true) ? 'default' : 'error'}
                placeholder="arn:aws:iam::123456789012:user/name"
                onChange={(_event, arnValue) => setArnValue(arnValue)}
                aria-label="AWS IAM ARN"
              />

              <FormGroupHelperText touched={arnTouched} error={validationMessage} />
            </FormGroup>
            <h3 id="grant-role-select">Role</h3>
            {roles.map((role) => generateRadio(role))}
          </Form>
        </>
      </Modal>
    )
  );
};

AddGrantModal.propTypes = {
  addGrantsMutate: PropTypes.func,
  roles: PropTypes.array,
  isAddGrantsPending: PropTypes.bool,
  isAddGrantsError: PropTypes.bool,
  addGrantsError: PropTypes.object,
  resetAddGrantsMutate: PropTypes.func,
};

export default AddGrantModal;
