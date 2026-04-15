import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  ButtonVariant,
  Card,
  CardBody,
  Divider,
  EmptyState,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

import { getOCMResourceType } from '~/common/analytics';
import { noQuotaTooltip } from '~/common/helpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { getDefaultClusterAutoScaling } from '~/components/clusters/common/clusterAutoScalingValues';
import { LoadingSkeletonCard } from '~/components/clusters/common/LoadingSkeletonCard/LoadingSkeletonCard';
import { MachineConfiguration } from '~/components/clusters/common/MachineConfiguration';
import { MAX_NODES_INSUFFICIEN_VERSION as MAX_NODES_180 } from '~/components/clusters/common/machinePools/constants';
import { getMaxNodesTotalDefaultAutoscaler } from '~/components/clusters/common/machinePools/utils';
import {
  refetchClusterAutoscalerData,
  useFetchClusterAutoscaler,
} from '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useFetchClusterAutoscaler';
import { useFetchMachineTypes } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import { useDeleteMachinePool } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useDeleteMachinePool';
import { useFetchMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import {
  ENABLE_MACHINE_CONFIGURATION,
  MAX_NODES_TOTAL_249,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';
import { clusterService } from '~/services';
import { getClusterServiceForRegion } from '~/services/clusterService';

import { getOrganizationAndQuota } from '../../../../../redux/actions/userActions';
import ButtonWithTooltip from '../../../../common/ButtonWithTooltip';
import ErrorBox from '../../../../common/ErrorBox';
import { openModal } from '../../../../common/Modal/ModalActions';
import modals from '../../../../common/Modal/modals';
import shouldShowModal from '../../../../common/Modal/ModalSelectors';
import clusterStates, {
  isAWS,
  isCCS,
  isHibernating,
  isHypershiftCluster,
  isOSD,
  isROSA,
} from '../../../common/clusterStates';

import { ClusterAutoscalerForm } from './components/AutoscalerModal/ClusterAutoscalerForm';
import DeleteMachinePoolModal from './components/DeleteMachinePoolModal/DeleteMachinePoolModal';
import EditMachinePoolModal from './components/EditMachinePoolModal/EditMachinePoolModal';
import { hasDefaultOrExplicitAutoscalingMachinePool } from './machinePoolsHelper';
import {
  hasMachinePoolsQuotaSelector,
  hasOrgLevelBypassPIDsLimitCapability,
} from './machinePoolsSelectors';
import { MachinePoolsTable } from './MachinePoolsTable';
import { UpdateAllMachinePools, UpdateMachinePoolModal } from './UpdateMachinePools';

import './MachinePools.scss';

const MachinePools = ({ cluster }) => {
  const dispatch = useDispatch();
  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);

  const isDeleteMachinePoolModalOpen = useGlobalState((state) =>
    shouldShowModal(state, modals.DELETE_MACHINE_POOL),
  );
  const isClusterAutoscalingModalOpen = useGlobalState((state) =>
    shouldShowModal(state, modals.EDIT_CLUSTER_AUTOSCALING_V2),
  );

  const hasMachineConfiguration = useFeatureGate(ENABLE_MACHINE_CONFIGURATION);
  const organization = useGlobalState((state) => state.userProfile.organization);

  const canBypassPIDsLimit = hasOrgLevelBypassPIDsLimitCapability(organization?.details);
  const isHypershift = isHypershiftCluster(cluster);
  const region = cluster?.subscription?.rh_region_id;
  const clusterID = cluster?.id;

  // Calculate analytics resource type for tracking
  const planType = cluster?.subscription?.plan?.id ?? normalizedProducts.UNKNOWN;
  const analyticsResourceType = getOCMResourceType(planType);
  const clusterVersionID = cluster?.version?.id;
  const clusterRawVersionID = cluster?.version?.raw_id;
  // Initial state
  const [hideDeleteMachinePoolError, setHideDeleteMachinePoolError] = React.useState(false);
  const [editMachinePoolId, setEditMachinePoolId] = React.useState(undefined);
  const [addMachinePool, setAddMachinePool] = React.useState(false);
  const [showMachinePoolsConfigModal, setShowMachinePoolsConfigModal] = React.useState(false);

  const {
    data: machineTypes,
    isLoading: isMachineTypesLoading,
    isError: isMachineTypesError,
    error: machineTypesError,
    refetch: refetchMachineTypes,
  } = useFetchMachineTypes(region);

  const {
    data: machinePoolData,
    isLoading: isMachinePoolLoading,
    isError: isMachinePoolError,
    error: machinePoolError,
    refetch: machinePoolOrNodePoolsRefetch,
  } = useFetchMachineOrNodePools(
    clusterID,
    isHypershift,
    clusterVersionID,
    region,
    clusterRawVersionID,
  );

  const {
    data: clusterAutoscalerData,
    isLoading: isClusterAutoscalerLoading,
    hasClusterAutoscaler,
    isStale: isClusterAutoscalerStale,
    isRefetching: isClusterAutoscalerRefetching,
  } = useFetchClusterAutoscaler(clusterID, region);

  const {
    mutate: deleteMachinePoolMutation,
    isPending: isDeleteMachinePoolPending,
    isError: isDeleteMachinePoolError,
    isSuccess: isDeleteMachinePoolSuccess,
    error: deleteMachinePoolError,
  } = useDeleteMachinePool(clusterID, isHypershift, region);

  React.useEffect(() => {
    refetchMachineTypes();
    dispatch(getOrganizationAndQuota());
    // Should run only once on mount and once on unmount
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isDeleteMachinePoolPending && isDeleteMachinePoolSuccess && !isMachinePoolLoading) {
      dispatch(getOrganizationAndQuota());
      machinePoolOrNodePoolsRefetch();
    }

    if (
      !isHypershiftCluster(cluster) &&
      hasClusterAutoscaler &&
      isClusterAutoscalerStale &&
      !isClusterAutoscalerLoading
    ) {
      refetchClusterAutoscalerData(clusterID);
    }
    // cluster and getOrganizationAndQuota create infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDeleteMachinePoolPending,
    isDeleteMachinePoolError,
    isDeleteMachinePoolSuccess,
    isMachinePoolLoading,
    clusterAutoscalerData,
    hasClusterAutoscaler,
    isClusterAutoscalerLoading,
    machinePoolOrNodePoolsRefetch,
    refetchClusterAutoscalerData,
  ]);

  const maxNodesTotalDefault = useMemo(
    () =>
      allow249NodesOSDCCSROSA
        ? getMaxNodesTotalDefaultAutoscaler(cluster.version?.raw_id, cluster.multi_az)
        : MAX_NODES_180,
    [allow249NodesOSDCCSROSA, cluster.version?.raw_id, cluster.multi_az],
  );

  const hasMachinePoolsQuota = hasMachinePoolsQuotaSelector(
    organization,
    cluster,
    machineTypes.types,
  );
  const machinePoolsActions = cluster?.machinePoolsActions || {}; // Data not defined on the cluster list response
  const hasMachinePools = !!machinePoolData?.length;
  const hasAutoscalingMachinePools = hasDefaultOrExplicitAutoscalingMachinePool(
    cluster,
    machinePoolData,
  );

  const kubeletConfigActions = cluster?.kubeletConfigActions || {}; // Data not defined on the cluster list response
  const isRosa = isROSA(cluster);
  const isOsd = isOSD(cluster);
  const isCcs = isCCS(cluster);
  const isAws = isAWS(cluster);
  const showMachineConfigurationAction =
    hasMachineConfiguration && ((isRosa && !isHypershift) || (isOsd && isCcs && isAws));
  const canEditMachineConfiguration = kubeletConfigActions.create && kubeletConfigActions.update;
  const isMachineConfigurationActionDisabled =
    cluster?.state !== clusterStates.ready || !canEditMachineConfiguration;
  const isMachineConfigurationActionDisabledReason =
    isMachineConfigurationActionDisabled &&
    (!canEditMachineConfiguration
      ? 'You do not have permission to edit the machine configuration. Only cluster owners and cluster editors can edit machine configuration.'
      : 'Machine configuration is only available when the cluster is ready.');

  if (hasMachinePools && machinePoolError?.error) {
    return (
      <EmptyState>
        <ErrorBox message="Error retrieving machine pools" response={machinePoolError.error} />
      </EmptyState>
    );
  }

  const refreshMachinePools = () => {
    if (!isMachinePoolLoading) {
      machinePoolOrNodePoolsRefetch();
    }
  };

  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const quotaReason = !hasMachinePoolsQuota && noQuotaTooltip;
  const hibernatingReason =
    isHibernating(cluster) && 'This operation is not available while cluster is hibernating';
  // Workaround until these are fixed, once fixed revert changes:
  // https://issues.redhat.com/browse/OCMUI-1221
  // https://issues.redhat.com/browse/OCM-5468
  const canNotCreateOrEditReason =
    !machinePoolsActions.update &&
    'You do not have permission to add or edit machine pools. Only cluster owners, cluster editors, machine pool editors and Organization Administrators can edit machine pools.';

  const canNotEditAutoscalerReason =
    (!cluster?.canEditClusterAutoscaler &&
      'You do not have permission to edit the cluster autoscaler.') ||
    (hasClusterAutoscaler && isClusterAutoscalerLoading && 'The cluster autoscaler is loading.');

  const tableActionsDisabled = !!(readOnlyReason || hibernatingReason || canNotCreateOrEditReason);

  const showSkeleton = !hasMachinePools && isMachinePoolLoading;
  const openAutoScalingModal = () => dispatch(openModal(modals.EDIT_CLUSTER_AUTOSCALING_V2));
  const initialValues = getDefaultClusterAutoScaling(maxNodesTotalDefault);

  return (
    <>
      {showSkeleton ? (
        <LoadingSkeletonCard />
      ) : (
        <>
          {!tableActionsDisabled && (
            <UpdateAllMachinePools
              isMachinePoolError={isMachinePoolError}
              clusterId={clusterID}
              isHypershift={isHypershift}
              controlPlaneVersion={clusterVersionID}
              controlPlaneRawVersion={clusterRawVersionID}
              machinePoolData={machinePoolData}
              region={region}
              refreshMachinePools={refreshMachinePools}
            />
          )}
          <Card className="ocm-c-machine-pools__card">
            <CardBody className="ocm-c-machine-pools__card--body">
              {isMachinePoolError && (
                <ErrorBox message="Error retrieving machine pools" response={machinePoolError} />
              )}
              <Toolbar>
                <ToolbarContent>
                  <ToolbarItem>
                    <ButtonWithTooltip
                      disableReason={
                        readOnlyReason ||
                        hibernatingReason ||
                        canNotCreateOrEditReason ||
                        quotaReason
                      }
                      id="add-machine-pool"
                      onClick={() => setAddMachinePool(true)}
                      variant={ButtonVariant.secondary}
                    >
                      Add machine pool
                    </ButtonWithTooltip>
                  </ToolbarItem>
                  {!isHypershift && (
                    <ToolbarItem>
                      <ButtonWithTooltip
                        id="edit-existing-cluster-autoscaling"
                        disableReason={
                          readOnlyReason || hibernatingReason || canNotEditAutoscalerReason
                        }
                        onClick={() => openAutoScalingModal()}
                        variant={ButtonVariant.secondary}
                      >
                        Edit cluster autoscaling
                      </ButtonWithTooltip>
                    </ToolbarItem>
                  )}
                  {showMachineConfigurationAction && (
                    <ToolbarItem>
                      <ButtonWithTooltip
                        disableReason={isMachineConfigurationActionDisabledReason}
                        onClick={() => setShowMachinePoolsConfigModal(true)}
                        variant={ButtonVariant.secondary}
                      >
                        Edit machine configuration
                      </ButtonWithTooltip>
                    </ToolbarItem>
                  )}
                </ToolbarContent>
              </Toolbar>
              <Divider />
              {isDeleteMachinePoolError && !hideDeleteMachinePoolError && (
                <ErrorBox
                  message="Error deleting machine pool"
                  response={deleteMachinePoolError?.error}
                  showCloseBtn
                  onCloseAlert={() => setHideDeleteMachinePoolError(true)}
                  analyticsType="error-delete-machine-pool"
                  analyticsResourceType={analyticsResourceType}
                />
              )}
              {machinePoolsActions.list && (
                <MachinePoolsTable
                  isHypershift={isHypershift}
                  machinePoolData={machinePoolData}
                  isDeleteMachinePoolPending={isDeleteMachinePoolPending}
                  isDeleteMachinePoolSuccess={isDeleteMachinePoolSuccess}
                  isDeleteMachinePoolError={isDeleteMachinePoolError}
                  setEditMachinePoolId={setEditMachinePoolId}
                  setHideDeleteMachinePoolError={setHideDeleteMachinePoolError}
                  cluster={cluster}
                  isMachinePoolError={isMachinePoolError}
                  machinePoolsActions={machinePoolsActions}
                  machineTypes={machineTypes}
                  tableActionsDisabled={tableActionsDisabled}
                  deleteMachinePoolMutation={deleteMachinePoolMutation}
                />
              )}
            </CardBody>
          </Card>
        </>
      )}
      {isDeleteMachinePoolModalOpen && <DeleteMachinePoolModal />}
      {(!!editMachinePoolId || addMachinePool) && (
        <EditMachinePoolModal
          region={region}
          cluster={cluster}
          onSave={refreshMachinePools}
          onClose={() => {
            setEditMachinePoolId(undefined);
            setAddMachinePool(false);
          }}
          isHypershift={isHypershift}
          machinePoolId={editMachinePoolId}
          machinePoolsResponse={machinePoolData}
          machinePoolsLoading={isMachinePoolLoading}
          machinePoolsError={isMachinePoolError}
          machinePoolsErrorResponse={machinePoolError?.error}
          machineTypesResponse={machineTypes}
          machineTypesLoading={isMachineTypesLoading}
          machineTypesError={isMachineTypesError}
          machineTypesErrorResponse={machineTypesError?.error}
        />
      )}
      <UpdateMachinePoolModal
        isHypershift={isHypershift}
        clusterId={clusterID}
        refreshMachinePools={refreshMachinePools}
        controlPlaneVersion={clusterVersionID}
        controlPlaneRawVersion={clusterRawVersionID}
        region={region}
      />
      {isClusterAutoscalingModalOpen && (
        <ClusterAutoscalerForm
          clusterAutoscalerData={clusterAutoscalerData}
          hasClusterAutoscaler={hasClusterAutoscaler}
          clusterId={clusterID}
          initialValues={initialValues}
          isWizard={false}
          hasAutoscalingMachinePools={hasAutoscalingMachinePools}
          isClusterAutoscalerRefetching={isClusterAutoscalerRefetching}
          maxNodesTotalDefault={maxNodesTotalDefault}
        />
      )}
      {showMachinePoolsConfigModal && (
        <MachineConfiguration
          clusterID={cluster.id}
          getMachineConfiguration={
            region
              ? getClusterServiceForRegion(region).getKubeletConfiguration
              : clusterService.getKubeletConfiguration
          }
          createMachineConfiguration={
            region
              ? getClusterServiceForRegion(region).postKubeletConfiguration
              : clusterService.postKubeletConfiguration
          }
          updateMachineConfiguration={
            region
              ? getClusterServiceForRegion(region).patchKubeletConfiguration
              : clusterService.patchKubeletConfiguration
          }
          onClose={() => setShowMachinePoolsConfigModal(false)}
          canBypassPIDsLimit={canBypassPIDsLimit}
        />
      )}
    </>
  );
};

MachinePools.propTypes = {
  cluster: PropTypes.object.isRequired,
};

export default MachinePools;
