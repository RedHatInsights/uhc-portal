import React from 'react';
import { Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { Content, ExpandableSection, Form, Grid, GridItem, Title } from '@patternfly/react-core';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { required } from '~/common/validators';
import { getNodesCount } from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import MachineTypeSelection from '~/components/clusters/common/ScaleSection-deprecated/MachineTypeSelection';
import { CloudProviderType, FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import {
  clearMachineTypesByRegion,
  getMachineTypes,
  getMachineTypesByRegion,
} from '~/redux/actions/machineTypesActions';
import { GlobalState } from '~/redux/stateTypes';
import { AWSCredentials } from '~/types/types';

import { getAwsCcsCredentials } from '../../utils/ccsCredentials';

import { AutoScale } from './AutoScale/AutoScale';
import ComputeNodeCount from './ComputeNodeCount/ComputeNodeCount';
import { ImdsSectionField } from './ImdsSectionField/ImdsSectionField';
import { NodeLabelsFieldArray } from './NodeLabelsFieldArray';

export const MachinePool = () => {
  const dispatch = useDispatch();
  const {
    values: {
      [FieldId.BillingModel]: billingModel,
      [FieldId.Product]: product,
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.AutoscalingEnabled]: autoscalingEnabled,
      [FieldId.MultiAz]: multiAz,
      [FieldId.Byoc]: byoc,
      [FieldId.NodesCompute]: nodesCompute,
      [FieldId.NodeLabels]: nodeLabels,
      [FieldId.Region]: region,
    },
    values,
    errors,
    getFieldProps,
    setFieldValue,
    getFieldMeta,
    setFieldTouched,
  } = useFormState();
  const isMultiAz = multiAz === 'true';
  const isByoc = byoc === 'true';
  const isRosa = product === normalizedProducts.ROSA;
  const isAWS = cloudProvider === CloudProviderType.Aws;
  const canAutoScale = useCanClusterAutoscale(product, billingModel);
  const [isNodeLabelsExpanded, setIsNodeLabelsExpanded] = React.useState(false);
  const awsCreds = React.useMemo<AWSCredentials>(() => getAwsCcsCredentials(values), [values]);

  const [loadNewMachineTypes, setLoadNewMachineTypes] = React.useState(false);
  const machineTypesByRegion = useSelector((state: GlobalState) => state.machineTypesByRegion);

  React.useEffect(() => {
    if (machineTypesByRegion.region) {
      if (!isByoc || !isAWS || cloudProvider === CloudProviderType.Gcp || isRosa) {
        // purge cache when related wizard context changes, i.e. provider/product/credentials
        dispatch(clearMachineTypesByRegion());
      }
    }
  }, [
    cloudProvider,
    isRosa,
    machineTypesByRegion.region,
    isByoc,
    isAWS,
    dispatch,
    region,
    setFieldValue,
  ]);

  React.useEffect(() => {
    if (isAWS && isByoc) {
      if (!machineTypesByRegion.region || machineTypesByRegion.region?.id !== region) {
        setLoadNewMachineTypes(true);
        setFieldValue(FieldId.MachineTypeForceChoice, false);
      }
      // no preiously loaded machineTypesByRegion in redux, load new machines
    }
  }, [machineTypesByRegion.region, isAWS, isByoc, region, setFieldValue]);

  // If no value has been set for compute nodes already,
  // set an initial value based on infrastructure and availability selections.
  React.useEffect(() => {
    if (!nodesCompute) {
      setFieldValue(FieldId.NodesCompute, getNodesCount(isByoc, isMultiAz));
    }
  }, [isByoc, isMultiAz, nodesCompute, setFieldValue]);

  // Expand Node labels section when errors exist
  React.useEffect(() => {
    if (!isNodeLabelsExpanded && errors[FieldId.NodeLabels]) {
      setIsNodeLabelsExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors[FieldId.NodeLabels], isNodeLabelsExpanded]);

  React.useEffect(() => {
    if (nodeLabels[0]?.key) setFieldTouched(FieldId.NodeLabels, true, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    dispatch(getMachineTypes());
  }, [dispatch]);

  React.useEffect(() => {
    if (nodeLabels[0]?.key) setIsNodeLabelsExpanded(true);
  }, [nodeLabels]);

  React.useEffect(() => {
    if (
      loadNewMachineTypes &&
      awsCreds?.access_key_id &&
      awsCreds?.account_id &&
      awsCreds?.secret_access_key &&
      region
    ) {
      dispatch(
        getMachineTypesByRegion(
          awsCreds?.access_key_id as string,
          awsCreds?.account_id as string,
          awsCreds?.secret_access_key as string,
          region,
        ),
      );
      setLoadNewMachineTypes(false);
    }
  }, [
    dispatch,
    loadNewMachineTypes,
    awsCreds?.access_key_id,
    awsCreds?.account_id,
    awsCreds?.secret_access_key,
    region,
  ]);

  const nodeLabelsExpandableSection = (
    <ExpandableSection
      toggleText="Add node labels"
      className="pf-v6-u-mt-md"
      onToggle={(_event, isExpanded) => setIsNodeLabelsExpanded(isExpanded)}
      isExpanded={isNodeLabelsExpanded}
      data-testid="node-labels-toggle"
    >
      <Title headingLevel="h3">Node labels (optional)</Title>
      <p className="pf-v6-u-mb-md">
        Configure labels that will apply to all nodes in this machine pool.
      </p>
      <NodeLabelsFieldArray />
    </ExpandableSection>
  );

  // OSD CCS only (or ROSA Classic in the future)
  const imdsSection = isAWS && isByoc && (
    <>
      <GridItem md={8}>
        <ImdsSectionField />
      </GridItem>
      <GridItem md={4} />
    </>
  );
  return (
    <Form>
      <GridItem>
        <Title headingLevel="h3">Default machine pool</Title>
        <Content component="p" className="pf-v6-u-mt-sm">
          Select a compute node instance type and count for your default machine pool. After cluster
          creation, your selected default machine pool instance type is permanent.
        </Content>
      </GridItem>

      <Grid hasGutter>
        <GridItem md={6}>
          <Field
            component={MachineTypeSelection}
            name={FieldId.MachineType}
            validate={required}
            isMultiAz={isMultiAz}
            isBYOC={isByoc}
            cloudProviderID={cloudProvider}
            product={product}
            isMachinePool={false}
            billingModel={billingModel}
            machine_type={{
              input: {
                ...getFieldProps(FieldId.MachineType),
                onChange: (value: string) => setFieldValue(FieldId.MachineType, value),
              },
              meta: getFieldMeta(FieldId.MachineType),
            }}
            machine_type_force_choice={{
              input: {
                ...getFieldProps(FieldId.MachineTypeForceChoice),
                onChange: (value: string) => setFieldValue(FieldId.MachineTypeForceChoice, value),
              },
            }}
          />
        </GridItem>

        <GridItem md={6} />

        {canAutoScale && (
          <>
            <GridItem>
              <AutoScale />
            </GridItem>
            {autoscalingEnabled && imdsSection}
            {autoscalingEnabled && nodeLabelsExpandableSection}
          </>
        )}
        {!autoscalingEnabled && (
          <>
            <GridItem md={6}>
              <ComputeNodeCount />
            </GridItem>
            {imdsSection}
            {nodeLabelsExpandableSection}
            <GridItem md={6} />
          </>
        )}
      </Grid>
    </Form>
  );
};
