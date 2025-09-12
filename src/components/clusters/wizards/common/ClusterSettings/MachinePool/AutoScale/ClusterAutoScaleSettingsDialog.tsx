import React, { FormEvent } from 'react';
import { useDispatch } from 'react-redux';

import { Content, Form, FormSection, Grid, GridItem } from '@patternfly/react-core';

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
import { FieldId } from '~/components/clusters/wizards/common/constants';
import { BooleanDropdownField } from '~/components/clusters/wizards/form/BooleanDropdownField';
import { TextInputField } from '~/components/clusters/wizards/form/TextInputField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ExternalLink from '~/components/common/ExternalLink';
import Modal from '~/components/common/Modal/Modal';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import useValidateMaxNodesTotal from '~/hooks/useValidateMaxNodesTotal';
import { useGlobalState } from '~/redux/hooks';

import {
  logVerbosityValidator,
  numberValidator,
  positiveNumberValidator,
  utilizationThresholdValidator,
} from './validators';

import './ClusterAutoScaleSettingsDialog.scss';

interface ClusterAutoScaleSettingsDialogProps {
  isWizard: boolean;
  isRosa: boolean;
  maxNodesTotalDefault: number;
}

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

const ClusterAutoScaleSettingsDialog = ({
  isWizard,
  isRosa,
  maxNodesTotalDefault,
}: ClusterAutoScaleSettingsDialogProps) => {
  const dispatch = useDispatch();
  const closeScalerModal = () => dispatch(closeModal());

  const isOpen = useGlobalState(
    (state) => state.modal.modalName === modals.EDIT_CLUSTER_AUTOSCALING_V2,
  );

  const {
    values: { [FieldId.ClusterAutoscaling]: clusterAutoScaling },
    errors: { [FieldId.ClusterAutoscaling]: autoScalingErrors },
    setFieldValue,
  } = useFormState();

  const handleSave = (e?: FormEvent<HTMLFormElement>) => {
    if (isWizard) {
      closeScalerModal();
    }
    if (e) {
      e.preventDefault();
    }
  };

  const handleReset = () => {
    setFieldValue(
      FieldId.ClusterAutoscaling,
      getDefaultClusterAutoScaling(maxNodesTotalDefault),
      true,
    );
  };

  const hasAutoScalingErrors = Object.keys(autoScalingErrors || {}).length > 0;
  const isScaleDownDisabled = clusterAutoScaling?.scale_down?.enabled === false;

  return (
    <Modal
      modalSize="large"
      isOpen={isOpen}
      title="Edit cluster autoscaling settings"
      data-testid="cluster-autoscaling-dialog"
      primaryText="Close"
      secondaryText="Revert all to defaults"
      onPrimaryClick={handleSave}
      onSecondaryClick={handleReset}
      isPrimaryDisabled={hasAutoScalingErrors}
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
        <Form onSubmit={handleSave} className="cluster-autoscaling-form">
          <FormSection title="General settings">
            <Grid hasGutter>
              {balancerFields.map((field) => (
                <GridItem span={6} key={field.name}>
                  {mapField(field)}
                </GridItem>
              ))}
              <GridItem span={6}>
                <TextInputField
                  name="cluster_autoscaling.balancing_ignored_labels"
                  label="balancing-ignored-labels"
                  type="text"
                  tooltip={AutoscalerIgnoredLabelsPopoverText}
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
                  {mapField(field)}
                </GridItem>
              ))}
              <GridItem span={6} key="resource_limits.max_nodes_total">
                <TextInputField
                  name="cluster_autoscaling.resource_limits.max_nodes_total"
                  label="max-nodes-total"
                  type="number"
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
                const isDisabled = isScaleDownDisabled && field.name !== 'scale_down.enabled';
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

export default ClusterAutoScaleSettingsDialog;
