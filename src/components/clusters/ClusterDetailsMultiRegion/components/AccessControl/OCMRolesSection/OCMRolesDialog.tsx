import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';

import {
  Content,
  ContentVariants,
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import { MutationFormattedErrorType } from '~/queries/types';
import { useGlobalState } from '~/redux/hooks';

import { ocmRoles } from '../../../../../../common/subscriptionTypes';
import Modal from '../../../../../common/Modal/Modal';
import { closeModal } from '../../../../../common/Modal/ModalActions';
import modals from '../../../../../common/Modal/modals';
import PopoverHint from '../../../../../common/PopoverHint';

import { OCMRolesRow } from './OCMRolesRow';

import './OCMRolesDialog.scss';

export type OCMRolesDialogProps = {
  onSubmit: (row: OCMRolesRow, username: string, roleID: string) => void;
  row: OCMRolesRow;
  productId?: string;
  isGrantOcmRolePending: boolean;
  isGrantOcmRoleError: boolean;
  isGrantOcmRoleSuccess: boolean;
  grantOcmRoleError: MutationFormattedErrorType | null;
  resetGrantOcmRoleMutation: () => void;
};

function OCMRolesDialog({
  onSubmit,
  row,
  productId,
  isGrantOcmRolePending,
  isGrantOcmRoleError,
  isGrantOcmRoleSuccess,
  grantOcmRoleError,
  resetGrantOcmRoleMutation,
}: OCMRolesDialogProps) {
  const [username, setUsername] = useState<string>(row.usernameValue || '');
  const [usernameValidationMsg, setUsernameValidationMsg] = useState('');
  const [APIErrorMsg, setAPIErrorMsg] = useState('');
  const [roleID, setRoleID] = useState<string>(ocmRoles.CLUSTER_EDITOR.id);
  const [isPrimaryDisabled, setIsPrimaryDisabled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isOpen = useGlobalState((state) => shouldShowModal(state, modals.OCM_ROLES));
  const dispatch = useDispatch();

  // when it's opened reset username and roleID
  // changes to the row are implicitly covered by isOpen.
  // No need to have it in the checklist.
  useEffect(() => {
    if (isOpen) {
      setUsername(row.usernameValue);
      setRoleID(row.roleValue || ocmRoles.CLUSTER_EDITOR.id);
      setUsernameValidationMsg('');
      setAPIErrorMsg('');
      setIsPrimaryDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    dispatch(closeModal());
    setIsDropdownOpen(false);
    setUsernameValidationMsg('');
  };

  // close the dialog if submit is successful.
  // otherwise display the error.
  useEffect(() => {
    if (isGrantOcmRolePending) {
      setAPIErrorMsg('');
      setIsPrimaryDisabled(true);
    } else if (isGrantOcmRoleSuccess) {
      handleClose();
    } else if (isGrantOcmRoleError && grantOcmRoleError) {
      if (grantOcmRoleError.error.errorCode === 404) {
        setAPIErrorMsg('This Red Hat login could not be found.');
      } else if (
        grantOcmRoleError.error.errorCode === 400 &&
        grantOcmRoleError.error.reason &&
        grantOcmRoleError.error.reason.toString().includes('belong to different organizations')
      ) {
        setAPIErrorMsg('This Red Hat login is not part of your organization.');
      } else {
        const errMsg = grantOcmRoleError.error.reason?.toString() || 'Unknown Error';
        const newAPIErrorMsg = errMsg.split(/\r?\n/).pop();
        // use the shorten message if it is in the form "ACCT-MGMT-XX:\nXXX"
        setAPIErrorMsg(
          newAPIErrorMsg && newAPIErrorMsg.endsWith('.') ? newAPIErrorMsg : `${newAPIErrorMsg}.`,
        );
      }
      setIsPrimaryDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGrantOcmRolePending, isGrantOcmRoleSuccess, isGrantOcmRoleError, grantOcmRoleError]);

  if (!isOpen) {
    return null;
  }

  const validateUsername = (val?: string): val is string => {
    setAPIErrorMsg('');
    if (!val) {
      setUsernameValidationMsg('Red Hat login cannot be empty.');
      setIsPrimaryDisabled(true);
      return false;
    }
    setUsernameValidationMsg('');
    setIsPrimaryDisabled(false);
    return true;
  };

  const handleUsernameChange = (inputVal: string) => {
    const usernameVal = inputVal.trim();
    setUsername(usernameVal);
    validateUsername(usernameVal);
  };

  const handleSubmit = (username: string, role: string) => {
    if (validateUsername(username)) {
      onSubmit(row, username, roleID);
      setIsDropdownOpen(false);
    }
  };

  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // TODO OCM RBAC phase 2: add the "learn more" link of links.OCM_DOCS_ROLES_AND_ACCESS
  // and add radio selection for roles.
  const title = row.isCreating ? 'Grant role' : 'Edit role';
  const btnText = row.isCreating ? 'Grant role' : 'Edit role';

  const options = Object.values(ocmRoles).filter((ocmRole) => {
    if (!productId || !ocmRole.excludeProductIds) {
      return true;
    }
    return !ocmRole.excludeProductIds.some((excludedId) => excludedId === productId);
  });

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isDropdownOpen}
      isFullWidth
      aria-label="roles menu"
      className="roles-select-menu-toggle"
    >
      {options.find((option) => option.id === roleID)?.name}
    </MenuToggle>
  );

  return (
    <Formik
      enableReinitialize
      initialValues={{
        username,
        role: roleID,
      }}
      onSubmit={async (values) => {
        handleSubmit(values.username, values.role);
      }}
    >
      {(formik) => (
        <Modal
          title={title}
          onClose={() => {
            handleClose();
            resetGrantOcmRoleMutation();
          }}
          primaryText={btnText}
          secondaryText="Cancel"
          onPrimaryClick={formik.submitForm}
          onSecondaryClick={() => {
            handleClose();
            resetGrantOcmRoleMutation();
          }}
          isPrimaryDisabled={isPrimaryDisabled}
          id="ocm-roles-access-dialog"
        >
          <p className="pf-v6-u-mb-xl">
            Allow users in your organization to edit or view clusters. These permissions only apply
            to cluster management in OpenShift Cluster Manager.
          </p>
          <Form className="control-form-cursor">
            <FormGroup
              label={
                <>
                  <span>Red Hat login</span>
                  <PopoverHint
                    id="ocm-roles-section-username-tooltip"
                    hint={
                      <Content>
                        <Content component={ContentVariants.p}>
                          Your Red Hat login is the username you use to access your Red Hat account.
                        </Content>
                      </Content>
                    }
                    iconClassName="text-input-tootip-icon"
                    hasAutoWidth
                    maxWidth="20.0rem"
                  />
                </>
              }
              isRequired
              fieldId="username"
            >
              <TextInput
                value={username}
                isRequired
                id="username"
                type="text"
                onChange={(_event, inputVal: string) => {
                  handleUsernameChange(inputVal);
                  formik.setFieldValue('username', inputVal);
                }}
                isDisabled={!row.isCreating}
                validated={usernameValidationMsg || APIErrorMsg ? 'error' : 'default'}
                aria-label="username"
              />

              <FormGroupHelperText touched error={usernameValidationMsg || APIErrorMsg} />
            </FormGroup>
            <FormGroup label="Role" isRequired>
              <Select
                isOpen={isDropdownOpen}
                selected={roleID}
                toggle={toggle}
                onOpenChange={(isDropdownOpen) => setIsDropdownOpen(isDropdownOpen)}
                onSelect={(e, selection) => {
                  formik.setFieldValue('role', selection as string);
                  setRoleID(selection as string);
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                <SelectList aria-label="roles">
                  {options.map((option) => (
                    <SelectOption
                      key={option.id}
                      value={option.id}
                      description={option.description}
                    >
                      {option.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FormGroup>
          </Form>
        </Modal>
      )}
    </Formik>
  );
}

OCMRolesDialog.modalName = modals.OCM_ROLES;

export { OCMRolesDialog };

export default OCMRolesDialog;
