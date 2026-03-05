import React from 'react';
import { useDispatch } from 'react-redux';

import { Content, Form, FormSection, Grid, GridItem, Switch } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import { clusterAutoScalingValidators, validateListOfBalancingLabels } from '~/common/validators';
import { getDefaultClusterAutoScaling } from '~/components/clusters/common/clusterAutoScalingValues';
import {
  AutoscalerGpuHelpText,
  AutoscalerGpuPopoverText,
} from '~/components/clusters/common/EditClusterAutoScalingDialog/AutoscalerGpuTooltip';
import {
  AutoscalerIgnoredLabelsHelpText,
  AutoscalerIgnoredLabelsPopoverText,
} from '~/components/clusters/common/EditClusterAutoScalingDialog/AutoscalerIgnoredLabelsTooltip';
import {
  balancerFields,
  FieldDefinition,
  resourceLimitsFields,
  scaleDownFields,
} from '~/components/clusters/common/EditClusterAutoScalingDialog/fieldDefinitions';
import { MaxNodesTotalPopoverText } from '~/components/clusters/common/EditClusterAutoScalingDialog/MaxNodesTotalTooltip';
import {
  logVerbosityValidator,
  numberValidator,
  positiveNumberValidator,
  utilizationThresholdValidator,
} from '~/components/clusters/wizards/common/ClusterSettings/MachinePool/AutoScale/validators';
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { TextInputField } from '~/components/clusters/wizards/form';
import { BooleanDropdownField } from '~/components/clusters/wizards/form/BooleanDropdownField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import Modal from '~/components/common/Modal/Modal';
import { modalActions } from '~/components/common/Modal/ModalActions';
import useValidateMaxNodesTotal from '~/hooks/useValidateMaxNodesTotal';
import { useDisableClusterAutoscaler } from '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useDisableClusterAutoscaler';
import { useEnableClusterAutoscaler } from '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useEnableClusterAutoscaler';
import { FormattedErrorData } from '~/queries/helpers';

import MachinePoolsAutoScalingWarning from '../../MachinePoolAutoscalingWarning';

const getValidator = (field: FieldDefinition) => {
  let validator;
  // Check for particular validators for specific fields
  switch (field.name) {
    case 'log_verbosity':
      validator = logVerbosityValidator;
      break;
    case 'pod_priority_threshold':
      validator = numberValidator;
      break;
    case 'scale_down.utilization_threshold':
      validator = utilizationThresholdValidator;
      break;
    default:
      break;
  }
  if (validator) {
    return validator;
  }

  // Check for generic validators for the rest of the fields
  switch (field.type) {
    case 'time':
      validator = clusterAutoScalingValidators.k8sTimeParameter;
      break;
    default:
      if (field.type === 'number' || field.type === 'min-max') {
        validator = positiveNumberValidator;
      }
      break;
  }
  return validator;
};

const mapField = (field: FieldDefinition, isDisabled?: boolean) => {
  if (field.type === 'boolean') {
    return (
      <BooleanDropdownField
        name={`cluster_autoscaling.${field.name}`}
        label={field.label}
        isDisabled={isDisabled}
        helperText={
          <span className="custom-help-text">Default value: {`${field.defaultValue}`}</span>
        }
      />
    );
  }

  const inputType = field.type === 'number' || field.type === 'min-max' ? 'number' : 'text';
  const validator = getValidator(field);

  return (
    <TextInputField
      name={`cluster_autoscaling.${field.name}`}
      label={field.label}
      type={inputType}
      isDisabled={isDisabled}
      showHelpTextOnError
      helperText={
        <span className="custom-help-text">Default value: {`${field.defaultValue}`}</span>
      }
      validate={validator}
    />
  );
};

type ClusterAutoscalerDialogProps = {
  submitForm: any;
  isUpdateClusterAutoscalerPending: boolean;
  clusterId: string;
  hasClusterAutoscaler: boolean;
  isRosa: boolean;
  isOpen: boolean;
  isWizard: boolean;
  dirty: boolean;
  hasAutoscalingMachinePools: boolean;
  isClusterAutoscalerRefetching: boolean;
  region?: string;
  maxNodesTotalDefault: number;
  isUpdateAutoscalerFormError: boolean;
  updateAutoscalerFormError: FormattedErrorData;
};

export const ClusterAutoscalerModal = ({
  submitForm,
  isUpdateClusterAutoscalerPending,
  clusterId,
  hasClusterAutoscaler,
  isRosa,
  isOpen,
  isWizard,
  dirty,
  hasAutoscalingMachinePools,
  region,
  isClusterAutoscalerRefetching,
  maxNodesTotalDefault,
  isUpdateAutoscalerFormError,
  updateAutoscalerFormError,
}: ClusterAutoscalerDialogProps) => {
  const {
    mutate: mutateDisableClusterAutoscaler,
    isPending: isDisableClusterAutoscalerPending,
    isError: isDisableClusterAutoscalerError,
    error: disableClusterAutoscalerError,
  } = useDisableClusterAutoscaler(clusterId, region);
  const {
    mutate: mutateEnableClusterAutoscaler,
    isPending: isEnableClusterAutoscalerPending,
    isError: isEnableClusterAutoscalerError,
    error: enableClusterAutoscalerError,
  } = useEnableClusterAutoscaler(clusterId, maxNodesTotalDefault, region);
  const dispatch = useDispatch();
  const {
    values: { [FieldId.ClusterAutoscaling]: clusterAutoScaling },
    errors: { [FieldId.ClusterAutoscaling]: autoScalingErrors },
    setFieldValue,
  } = useFormState();
  const isSaving =
    isDisableClusterAutoscalerPending ||
    isEnableClusterAutoscalerPending ||
    isUpdateClusterAutoscalerPending ||
    isClusterAutoscalerRefetching;
  const closeScalerModal = () => dispatch(modalActions.closeModal());

  const hasAutoScalingErrors = Object.keys(autoScalingErrors || {}).length > 0;
  const isScaleDownDisabled = clusterAutoScaling?.scale_down?.enabled === false;
  const isFormDisabled =
    !hasClusterAutoscaler || isUpdateClusterAutoscalerPending || isClusterAutoscalerRefetching;

  const handleReset = () =>
    setFieldValue(
      FieldId.ClusterAutoscaling,
      getDefaultClusterAutoScaling(maxNodesTotalDefault),
      true,
    );
  const toggleClusterAutoScaling = () => {
    if (!hasClusterAutoscaler) {
      mutateEnableClusterAutoscaler();
    } else if (hasClusterAutoscaler) {
      mutateDisableClusterAutoscaler();
    }
  };

  const handleSubmitForm = () => {
    if (dirty) {
      submitForm();
    } else {
      closeScalerModal();
    }
  };

  let primaryButtonProps = {
    text: 'Close',
    isClose: true,
    isDisabled: hasAutoScalingErrors,
  };
  if (isUpdateClusterAutoscalerPending || isClusterAutoscalerRefetching) {
    primaryButtonProps = { text: 'Saving...', isClose: false, isDisabled: true };
  } else if (dirty && !isUpdateClusterAutoscalerPending && !isClusterAutoscalerRefetching) {
    primaryButtonProps = { text: 'Save', isClose: false, isDisabled: hasAutoScalingErrors };
  }

  return (
    <Modal
      modalSize="large"
      isOpen={isOpen}
      title="Edit cluster autoscaling settings"
      data-testid="cluster-autoscaling-dialog"
      primaryText={primaryButtonProps.text}
      secondaryText="Revert all to defaults"
      onPrimaryClick={handleSubmitForm}
      onTertiaryClick={closeScalerModal}
      tertiaryText="Cancel"
      onSecondaryClick={handleReset}
      isPrimaryDisabled={hasAutoScalingErrors || primaryButtonProps.isDisabled}
      showTertiary={!isWizard}
      onClose={closeScalerModal}
    >
      <>
        <Content component="p">
          The cluster autoscaler adjusts the size of a cluster to meet its current deployment needs.
          Learn more about{' '}
          <ExternalLink
            href={
              isRosa ? installLinks.ROSA_CLUSTER_AUTOSCALING : installLinks.OSD_CLUSTER_AUTOSCALING
            }
          >
            cluster autoscaling
          </ExternalLink>{' '}
          or
          <ExternalLink href={installLinks.APPLYING_AUTOSCALING_API_DETAIL}> APIs</ExternalLink>.
        </Content>
        {!isWizard && (
          <div className="pf-v6-u-mt-md">
            <Switch
              className="pf-v6-u-ml-0 pf-v6-u-mb-md"
              label="Autoscale cluster"
              isChecked={hasClusterAutoscaler}
              hasCheckIcon
              isDisabled={isSaving}
              onChange={toggleClusterAutoScaling}
            />
            {isDisableClusterAutoscalerError ||
            isEnableClusterAutoscalerError ||
            isUpdateAutoscalerFormError ? (
              <ErrorBox
                message="Failed to update autoscaler"
                response={
                  disableClusterAutoscalerError.error ||
                  enableClusterAutoscalerError.error ||
                  updateAutoscalerFormError.error
                }
              />
            ) : (
              <MachinePoolsAutoScalingWarning
                hasClusterAutoScaler={hasClusterAutoscaler}
                hasAutoscalingMachinePools={hasAutoscalingMachinePools}
                isEnabledOnCurrentPool={false}
                warningType="clusterView"
              />
            )}
          </div>
        )}
        <Form className="cluster-autoscaling-form">
          <FormSection title="General settings">
            <Grid hasGutter>
              {balancerFields.map((field) => (
                <GridItem span={6} key={field.name}>
                  {mapField(field, isFormDisabled)}
                </GridItem>
              ))}
              <GridItem span={6}>
                <TextInputField
                  name="cluster_autoscaling.balancing_ignored_labels"
                  label="balancing-ignored-labels"
                  type="text"
                  tooltip={AutoscalerIgnoredLabelsPopoverText}
                  isDisabled={isFormDisabled}
                  showHelpTextOnError
                  helperText={
                    <span className="custom-help-text">{AutoscalerIgnoredLabelsHelpText}</span>
                  }
                  validate={validateListOfBalancingLabels}
                />
              </GridItem>
            </Grid>
          </FormSection>
          <FormSection title="Resource limits">
            <Grid hasGutter>
              {resourceLimitsFields.map((field) => (
                <GridItem span={6} key={field.name}>
                  {mapField(field, isFormDisabled)}
                </GridItem>
              ))}
              <GridItem span={6} key="resource_limits.max_nodes_total">
                <TextInputField
                  name="cluster_autoscaling.resource_limits.max_nodes_total"
                  label="max-nodes-total"
                  type="number"
                  isDisabled={isFormDisabled}
                  showHelpTextOnError
                  helperText={
                    <span className="custom-help-text">Default value: {maxNodesTotalDefault}</span>
                  }
                  validate={useValidateMaxNodesTotal(maxNodesTotalDefault)}
                  tooltip={<MaxNodesTotalPopoverText />}
                />
              </GridItem>
              <GridItem span={6}>
                <TextInputField
                  name="cluster_autoscaling.resource_limits.gpus"
                  label="GPUs"
                  type="text"
                  tooltip={AutoscalerGpuPopoverText}
                  isDisabled={isFormDisabled}
                  showHelpTextOnError
                  helperText={<span className="custom-help-text">{AutoscalerGpuHelpText}</span>}
                  validate={clusterAutoScalingValidators.k8sGpuParameter}
                />
              </GridItem>
            </Grid>
          </FormSection>
          <FormSection title="Scale down configuration">
            <Grid hasGutter>
              {scaleDownFields.map((field) => {
                const isDisabled =
                  isFormDisabled || (isScaleDownDisabled && field.name !== 'scale_down.enabled');
                return (
                  <GridItem span={6} key={field.name}>
                    {mapField(field, isDisabled)}
                  </GridItem>
                );
              })}
            </Grid>
          </FormSection>
        </Form>
      </>
    </Modal>
  );
};
