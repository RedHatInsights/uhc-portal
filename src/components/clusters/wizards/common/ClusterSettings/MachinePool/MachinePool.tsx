import React from 'react';
import { useDispatch } from 'react-redux';

import { Content, ExpandableSection, Form, Grid, GridItem, Title } from '@patternfly/react-core';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { getNodesCount } from '~/components/clusters/common/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { MachineTypeSelection } from '~/components/clusters/common/ScaleSection/MachineTypeSelection/MachineTypeSelection';
import { useMachineTypeSelection } from '~/components/clusters/common/ScaleSection/useMachineTypeSelection';
import { CloudProviderType, FieldId } from '~/components/clusters/wizards/common/constants';
import { getAwsCcsCredentials } from '~/components/clusters/wizards/common/utils/ccsCredentials';
import { useFormState } from '~/components/clusters/wizards/hooks';
import useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { useFetchMachineTypes } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import { useFetchMachineTypesByRegionCcs } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypesByRegionCcs';
import { getMachineTypes } from '~/redux/actions/machineTypesActions';

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
    setFieldValue,
    setFieldTouched,
  } = useFormState();
  const isMultiAz = multiAz === 'true';
  const isByoc = byoc === 'true';
  const isRosa = product === normalizedProducts.ROSA;
  const isAWS = cloudProvider === CloudProviderType.Aws;
  const canAutoScale = useCanClusterAutoscale(product, billingModel);
  const [isNodeLabelsExpanded, setIsNodeLabelsExpanded] = React.useState(false);
  const { data: machineTypesResponse, error: machineTypesError } = useFetchMachineTypes();

  const awsCreds = React.useMemo(() => getAwsCcsCredentials(values), [values]);
  const ccsMachineTypesByRegionEnabled =
    isAWS &&
    isByoc &&
    !isRosa &&
    cloudProvider !== CloudProviderType.Gcp &&
    Boolean(
      region && awsCreds?.access_key_id && awsCreds?.account_id && awsCreds?.secret_access_key,
    );

  const regionMachineTypesQuery = useFetchMachineTypesByRegionCcs({
    region,
    accessKeyId: awsCreds?.access_key_id,
    accountId: awsCreds?.account_id,
    secretAccessKey: awsCreds?.secret_access_key,
    enabled: ccsMachineTypesByRegionEnabled,
  });

  const regionMachineTypesError =
    regionMachineTypesQuery.isError && regionMachineTypesQuery.error
      ? {
          errorMessage:
            regionMachineTypesQuery.error instanceof Error
              ? regionMachineTypesQuery.error.message
              : String(regionMachineTypesQuery.error),
        }
      : undefined;

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

  const machineTypeSelectionProps = useMachineTypeSelection({
    fieldId: FieldId.MachineType,
    machineTypesResponse,
    machineTypesErrorResponse: machineTypesError?.error,
    isMultiAz,
    isBYOC: isByoc,
    cloudProviderID: cloudProvider,
    productId: product,
    billingModel,
    machineTypesByRegionResponse: regionMachineTypesQuery.data,
    machineTypesByRegionErrorResponse: regionMachineTypesError,
    machineTypesByRegionPending: regionMachineTypesQuery.isPending,
  });

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
          <MachineTypeSelection {...machineTypeSelectionProps} />
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
