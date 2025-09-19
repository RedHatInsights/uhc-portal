import React from 'react';
import { Field, Formik } from 'formik';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Button, Form, FormGroup } from '@patternfly/react-core';
import { LevelUpAltIcon } from '@patternfly/react-icons/dist/esm/icons/level-up-alt-icon';

import { CheckboxField, TextInputField } from '~/components/clusters/wizards/form';
import { CheckboxDescription } from '~/components/common/CheckboxDescription';
import ErrorBox from '~/components/common/ErrorBox';
import { AddOnsFormDropdown } from '~/components/common/formik/AddOnsFormDropdown';
import TextField from '~/components/common/formik/TextField';
import Modal from '~/components/common/Modal/Modal';
import { refetchClusterAddOns } from '~/queries/ClusterDetailsQueries/AddOnsTab/useFetchClusterAddOns';
import { getOrganizationAndQuota } from '~/redux/actions/userActions';
import { useGlobalState } from '~/redux/hooks';

import { closeModal } from '../../../../../common/Modal/ModalActions';
import shouldShowModal from '../../../../../common/Modal/ModalSelectors';
import { setAddonsDrawer } from '../AddOnsActions';
import {
  getParameters,
  getParameterValue,
  parameterValuesForEditing,
  quotaCostOptions,
} from '../AddOnsHelper';

import {
  getDefaultValueText,
  getFieldProps,
  getHelpText,
  getParamDefault,
  isFieldDisabled,
  setDefaultParamValue,
  validationsForParameterField,
} from './AddOnsFormModalHelpers';

import '../AddOns.scss';

const AddOnsParametersModal = ({
  clusterID,
  cluster,
  quota,
  updateClusterAddOn,
  isUpdateClusterAddOnError,
  updateClusterAddOnError,
  isUpdateClusterAddOnPending,
  addClusterAddOn,
  isAddClusterAddOnError,
  addClusterAddOnError,
  isAddClusterAddOnPending,
}) => {
  const dispatch = useDispatch();

  const isOpen = useGlobalState((state) => shouldShowModal(state, 'add-ons-parameters-modal'));
  const subscriptionModel = useGlobalState((state) => state.addOns.drawer.subscriptionModels);
  const { addOn, isUpdateForm, addOnInstallation } = useGlobalState((state) => state.modal.data);

  const initialValuesData = parameterValuesForEditing(addOnInstallation, addOn);

  const handleClose = (formik) => {
    formik.resetForm();
    dispatch(closeModal());
  };

  const handleFormSubmit = (values, formik) => {
    const addOnId = addOn.id;
    const { billingModel } = subscriptionModel[addOnId];
    const addOnRequest = {
      addon: {
        id: addOnId,
      },
      billing: {
        billing_model: billingModel,
        ...(subscriptionModel[addOnId].cloudAccount && {
          billing_marketplace_account: subscriptionModel[addOnId].cloudAccount,
        }),
      },
    };

    if (values) {
      addOnRequest.parameters = {
        items: Object.entries(values).map(([key, value]) => ({
          id: key,
          // Ensure all values are strings
          value: value.toString(),
        })),
      };
    }

    const updateAddOnProps = {
      clusterID,
      addOnID: addOnId,
      addOnData: addOnRequest,
    };
    const addAddOnProps = {
      clusterID,
      addOnData: addOnRequest,
    };

    if (isUpdateForm) {
      updateClusterAddOn(
        { ...updateAddOnProps },
        {
          onSuccess: () => {
            dispatch(getOrganizationAndQuota());
            handleClose(formik);
            refetchClusterAddOns();
            dispatch(
              setAddonsDrawer({
                open: false,
                activeCard: null,
              }),
            );
          },
        },
      );
    } else {
      addClusterAddOn(
        { ...addAddOnProps },
        {
          onSuccess: () => {
            dispatch(getOrganizationAndQuota());
            handleClose(formik);
            refetchClusterAddOns();
            dispatch(
              setAddonsDrawer({
                open: false,
                activeCard: null,
              }),
            );
          },
        },
      );
    }
  };

  const fieldForParam = (param, formik) => {
    if (param.value_type && param.value_type === 'boolean' && param.required) {
      return (
        <>
          <CheckboxField
            fieldId={`${param.id}`}
            {...getFieldProps(param, isUpdateForm, addOn, cluster, quota, addOnInstallation)}
            key={param.id}
            name={`${param.id}`}
            label={param.name}
            placeholder={getParamDefault(param, isUpdateForm)}
            isRequired={param.required}
            isDisabled={isFieldDisabled(param, isUpdateForm, addOnInstallation)}
            validate={(value) => validationsForParameterField(param, value)}
            description={getHelpText(param, isUpdateForm)}
          />
          <CheckboxDescription>{getHelpText(param, isUpdateForm)}</CheckboxDescription>
        </>
      );
    }

    if (param.value_type && param.value_type === 'boolean' && !param.required) {
      return (
        <>
          <CheckboxField
            fieldId={`${param.id}`}
            {...getFieldProps(param, isUpdateForm, addOn, cluster, quota, addOnInstallation)}
            key={param.id}
            name={`${param.id}`}
            label={param.name}
            placeholder={getParamDefault(param, isUpdateForm)}
            isRequired={param.required}
            isDisabled={isFieldDisabled(param, isUpdateForm, addOnInstallation)}
            description={getHelpText(param, isUpdateForm)}
          />
          <CheckboxDescription>{getHelpText(param, isUpdateForm)}</CheckboxDescription>
        </>
      );
    }

    if (param.options && param.options.length > 0) {
      let paramOptions;
      if (param.value_type === 'resource') {
        let defaultValue;
        if (isUpdateForm && param.id === addOn.resource_name) {
          defaultValue = 1;
        }
        const currentValue = Number(getParameterValue(addOnInstallation, param.id, defaultValue));
        paramOptions = quotaCostOptions(param.id, cluster, quota, param.options, currentValue);
      } else {
        paramOptions = param.options;
      }
      return (
        <Field
          component={AddOnsFormDropdown}
          options={[...paramOptions]}
          fieldId={`${param.id}`}
          {...getFieldProps(param, isUpdateForm, addOn, cluster, quota, addOnInstallation)}
          key={param.id}
          name={`${param.id}`}
          label={param.name}
          placeholder={getParamDefault(param, isUpdateForm)}
          isRequired={param.required}
          helperText={getHelpText(param, isUpdateForm)}
          isDisabled={isFieldDisabled(param, isUpdateForm, addOnInstallation)}
          placeHolderText={getParamDefault(param, isUpdateForm)}
          validateOnSubmit
          validate={(value) => validationsForParameterField(param, value)}
          meta={formik.getFieldMeta(param.id)}
        />
      );
    }

    if (!param.required) {
      return (
        <TextField
          key={param.id}
          name={`${param.id}`}
          label={param.name}
          isRequired={param.required}
          helpText={getHelpText(param, isUpdateForm)}
          isDisabled={isFieldDisabled(param, isUpdateForm, addOnInstallation)}
          placeHolderText={getParamDefault(param, isUpdateForm)}
          meta={formik.getFieldMeta(param.id)}
          fieldId={param.id}
        />
      );
    }

    return (
      <TextInputField
        validate={(value) => validationsForParameterField(param, value)}
        key={param.id}
        name={`${param.id}`}
        label={param.name}
        helperText={getHelpText(param, isUpdateForm)}
        isDisabled={isFieldDisabled(param, isUpdateForm, addOnInstallation)}
        placeHolderText={getParamDefault(param, isUpdateForm)}
        meta={formik.getFieldMeta(param.id)}
        validateOnSubmit
      />
    );
  };

  const isPending = isAddClusterAddOnPending || isUpdateClusterAddOnPending;

  return isOpen ? (
    <Formik
      initialValues={initialValuesData.parameters}
      onSubmit={async (values, formik) => {
        handleFormSubmit(values, formik);
      }}
    >
      {(formik) => (
        <Modal
          title={`Configure ${addOn.name}`}
          modalSize="medium"
          onClose={() => handleClose(formik)}
          primaryText={isUpdateForm ? 'Update' : 'Install'}
          secondaryText="Cancel"
          onPrimaryClick={formik.submitForm}
          onSecondaryClick={() => handleClose(formik)}
          isPrimaryDisabled={isUpdateForm && !formik.dirty}
          isPending={isPending}
        >
          {(isUpdateClusterAddOnError || isAddClusterAddOnError) && (
            <ErrorBox
              message="Error adding add-ons"
              response={updateClusterAddOnError || addClusterAddOnError}
            />
          )}
          <Form
            id={`form-addon-${addOn.id}`}
            onSubmit={(e) => {
              formik.submitForm();
              e.preventDefault();
            }}
          >
            {getParameters(addOn).map((param) => (
              <FormGroup key={param.id}>
                {fieldForParam(param, formik)}
                {((isUpdateForm && param.editable && param.default_value) ||
                  (!isUpdateForm && param.default_value)) && (
                  <Button
                    onClick={() => setDefaultParamValue(param, formik.setFieldValue)}
                    id={`reset-addon-${param.id}`}
                    variant="link"
                    icon={<LevelUpAltIcon />}
                    iconPosition="right"
                    className="addon-parameter-default-button"
                  >
                    Use default: {getDefaultValueText(param)}
                  </Button>
                )}
              </FormGroup>
            ))}
          </Form>
        </Modal>
      )}
    </Formik>
  ) : null;
};

AddOnsParametersModal.propTypes = {
  clusterID: PropTypes.string.isRequired,
  updateClusterAddOn: PropTypes.func.isRequired,
  isUpdateClusterAddOnError: PropTypes.bool.isRequired,
  isUpdateClusterAddOnPending: PropTypes.bool.isRequired,
  addClusterAddOn: PropTypes.func.isRequired,
  isAddClusterAddOnError: PropTypes.bool.isRequired,
  isAddClusterAddOnPending: PropTypes.bool.isRequired,
  updateClusterAddOnError: PropTypes.object.isRequired,
  addClusterAddOnError: PropTypes.object.isRequired,

  addOn: PropTypes.object,
  addOnInstallation: PropTypes.object,
  cluster: PropTypes.object.isRequired,
  quota: PropTypes.object.isRequired,
  isUpdateForm: PropTypes.bool,
  submitClusterAddOnResponse: PropTypes.object,
  change: PropTypes.func,
};

export default AddOnsParametersModal;
