import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { Button, FormGroup, GridItem } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { getDefaultClusterAutoScaling } from '~/components/clusters/common/clusterAutoScalingValues';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { MAX_NODES_INSUFFICIEN_VERSION as MAX_NODES_180 } from '~/components/clusters/common/machinePools/constants';
import { getMaxNodesTotalDefaultAutoscaler } from '~/components/clusters/common/machinePools/utils';
import { CheckboxField } from '~/components/clusters/wizards/form/CheckboxField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId as RosaFieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import PopoverHint from '~/components/common/PopoverHint';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { AutoScaleEnabledInputs } from './AutoScaleEnabledInputs';
import ClusterAutoScaleSettingsDialog from './ClusterAutoScaleSettingsDialog';

export const AutoScale = () => {
  const {
    values: {
      [RosaFieldId.Hypershift]: isHypershift,
      [RosaFieldId.Byoc]: byoc,
      [RosaFieldId.AutoscalingEnabled]: autoscalingEnabled,
      [RosaFieldId.Product]: product,
      [RosaFieldId.MultiAz]: multiAz,
      [RosaFieldId.ClusterVersion]: ClusterVersion,
    },
    setFieldValue,
  } = useFormState();
  const allow249Nodes = useFeatureGate(MAX_NODES_TOTAL_249);
  const dispatch = useDispatch();
  const openAutoScalingModal = () => dispatch(openModal(modals.EDIT_CLUSTER_AUTOSCALING_V2));

  const isRosa = product === normalizedProducts.ROSA;
  const autoScalingUrl = isRosa ? links.ROSA_AUTOSCALING : links.APPLYING_AUTOSCALING;
  const isHypershiftSelected = isHypershift === 'true';
  const isByoc = byoc === 'true';
  const isRosaClassicOrOsdCcs = !isHypershiftSelected && isByoc;
  const maxNodesTotalDefault = useMemo(
    () =>
      allow249Nodes
        ? getMaxNodesTotalDefaultAutoscaler(ClusterVersion?.raw_id, multiAz === 'true')
        : MAX_NODES_180,
    [allow249Nodes, ClusterVersion?.raw_id, multiAz],
  );
  const defaultAutoscalerValues = useMemo(
    () => getDefaultClusterAutoScaling(maxNodesTotalDefault),
    [maxNodesTotalDefault],
  );

  useEffect(() => {
    if (!autoscalingEnabled) {
      setFieldValue(RosaFieldId.ClusterAutoscaling, defaultAutoscalerValues);
    }
  }, [setFieldValue, defaultAutoscalerValues, autoscalingEnabled]);

  return (
    <GridItem id="autoscaling">
      <FormGroup
        fieldId="autoscaling"
        label="Autoscaling"
        labelHelp={
          <PopoverHint
            hint={
              <>
                {constants.autoscaleHint}{' '}
                <ExternalLink href={autoScalingUrl}>
                  Learn more about autoscaling
                  {isRosa ? ' with ROSA' : ''}
                </ExternalLink>
              </>
            }
          />
        }
      />

      <CheckboxField
        name={RosaFieldId.AutoscalingEnabled}
        label="Enable autoscaling"
        helperText={
          isRosaClassicOrOsdCcs
            ? 'The cluster autoscaler uses declarative, Kubernetes-style arguments to adjust the size of the cluster to meet its deployment needs.'
            : 'Autoscaling automatically adds and removes compute nodes from the cluster based on resource requirements.'
        }
      />

      {isRosaClassicOrOsdCcs ? (
        <GridItem md={3}>
          <Button
            data-testid="set-cluster-autoscaling-btn"
            variant="secondary"
            className="pf-v6-u-mt-md"
            onClick={openAutoScalingModal}
            isDisabled={!autoscalingEnabled}
          >
            Edit cluster autoscaling settings
          </Button>
        </GridItem>
      ) : null}
      <ClusterAutoScaleSettingsDialog
        isWizard
        isRosa={isRosa}
        maxNodesTotalDefault={maxNodesTotalDefault}
      />
      {autoscalingEnabled ? <AutoScaleEnabledInputs /> : null}
    </GridItem>
  );
};
