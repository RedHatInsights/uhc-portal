import * as React from 'react';
import { AxiosError } from 'axios';
import { Formik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch } from 'react-redux';

import {
  Button,
  Content,
  ContentVariants,
  ExpandableSection,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Spinner,
  Split,
  SplitItem,
  StackItem,
  Tabs,
  Title,
  Tooltip,
} from '@patternfly/react-core';

import { getErrorMessage } from '~/common/errors';
import getClusterName from '~/common/getClusterName';
import { isHypershiftCluster } from '~/components/clusters/common/clusterStates';
import { getMaxNodesHCP, getNodeCount } from '~/components/clusters/common/machinePools/utils';
import { CloudProviderType } from '~/components/clusters/wizards/common';
import { ShieldedVM } from '~/components/clusters/wizards/common/ShieldedVM';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ImdsSection from '~/components/clusters/wizards/rosa/MachinePoolScreen/components/ImdsSection';
import ErrorBox from '~/components/common/ErrorBox';
import { closeModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useFetchMachineTypes } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import { useEditCreateMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useEditCreateMachineOrNodePools';
import { useFetchMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import {
  CAPACITY_RESERVATION_ID_FIELD,
  GCP_SECURE_BOOT,
  IMDS_SELECTION,
  MAX_NODES_TOTAL_249,
  TABBED_MACHINE_POOL_MODAL,
} from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { MachineTypesResponse } from '~/queries/types';
import { useGlobalState } from '~/redux/hooks';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription, ErrorState } from '~/types/types';

import { canUseSpotInstances } from '../../machinePoolsHelper';

import AutoRepairField from './fields/AutoRepairField';
import CapacityReservationField from './fields/CapacityReservationField';
import DiskSizeField from './fields/DiskSizeField';
import useMachinePoolFormik, { EditMachinePoolValues } from './hooks/useMachinePoolFormik';
import EditDetailsSection from './sections/EditDetailsSection';
import EditLabelsSection from './sections/EditLabelsSection';
import EditNodeCountSection from './sections/EditNodeCountSection';
import EditTaintsSection from './sections/EditTaintsSection';
import EditSecurityGroupsSection from './sections/SecurityGroups/EditSecurityGroupsSection';
import SpotInstancesSection from './sections/SpotInstancesSection';
import { useCostSavingsSubTab } from './subtabs/CostSavingsSubTab';
import { useLabelsTagsTaintsSubTab } from './subtabs/LabelsTagsTaintsSubTab';
import { useMaintenanceSubTab } from './subtabs/MaintenanceSubTab';
import { useOverviewSubTab } from './subtabs/OverviewSubTab';
import { useSecurityGroupsSubTab } from './subtabs/SecurityGroupsSubTab';

const modalDescription =
  'A machine pool is a group of machines that are all clones of the same configuration, that can be used on demand by an application running on a pod.';

const SubmitButton = ({
  isMaxReached,
  isValid,
  isSubmitting,
  machinePoolsResponse,
  machineTypesResponse,
  initialValues,
  values,
  submitForm,
  isEdit,
}: {
  isMaxReached: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  machinePoolsResponse: MachinePool[];
  machineTypesResponse: MachineTypesResponse;
  initialValues: EditMachinePoolValues;
  values: EditMachinePoolValues;
  submitForm: () => void;
  isEdit: boolean;
}) => (
  <Button
    isAriaDisabled={isMaxReached}
    isDisabled={
      !isValid ||
      isSubmitting ||
      !machinePoolsResponse ||
      !machineTypesResponse ||
      isEqual(initialValues, values)
    }
    onClick={submitForm}
    isLoading={isSubmitting}
    className="pf-v6-u-mr-md"
    data-testid="submit-btn"
  >
    {isEdit ? 'Save' : 'Add machine pool'}
  </Button>
);

type EditMachinePoolModalProps = {
  cluster: ClusterFromSubscription;
  region?: string;
  onClose: () => void;
  onSave?: () => void;
  machinePoolId?: string;
  isEdit?: boolean;
  shouldDisplayClusterName?: boolean;
  machinePoolsResponse?: MachinePool[];
  machineTypesResponse: MachineTypesResponse;
  isHypershift?: boolean;
  machinePoolsLoading: boolean;
  machinePoolsError: boolean;
  machineTypesLoading: boolean;
  machineTypesError: boolean;
  machinePoolsErrorResponse: Pick<ErrorState, 'errorMessage' | 'errorDetails' | 'operationID'>;
  machineTypesErrorResponse: Pick<ErrorState, 'errorMessage' | 'errorDetails' | 'operationID'>;
};

const EditMachinePoolModal = ({
  cluster,
  region,
  onClose,
  onSave,
  machinePoolId,
  isEdit: isInitEdit,
  machinePoolsResponse,
  machineTypesResponse,
  shouldDisplayClusterName,
  isHypershift,
  machinePoolsLoading,
  machinePoolsError,
  machineTypesLoading,
  machineTypesError,
  machineTypesErrorResponse,
  machinePoolsErrorResponse,
}: EditMachinePoolModalProps) => {
  const tabbedMachinePoolModalFeature = useFeatureGate(TABBED_MACHINE_POOL_MODAL);

  const STARTING_TAB_KEY: number = 1;
  const getIsEditValue = React.useCallback(
    () => !!isInitEdit || !!machinePoolId,
    [isInitEdit, machinePoolId],
  );

  const clusterName = getClusterName(cluster);
  const [submitError, setSubmitError] = React.useState<AxiosError<any>>();
  const [currentMachinePool, setCurrentMachinePool] = React.useState<MachinePool>();
  const [isEdit, setIsEdit] = React.useState<boolean>(getIsEditValue());
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(STARTING_TAB_KEY);
  const { initialValues, validationSchema } = useMachinePoolFormik({
    machinePool: currentMachinePool,
    cluster,
    machinePools: machinePoolsResponse || [],
    machineTypes: machineTypesResponse,
  });

  const isGCP = cluster?.cloud_provider?.id === CloudProviderType.Gcp;

  const allow249NodesOSDCCSROSA = useFeatureGate(MAX_NODES_TOTAL_249);
  const isSecureBootEnabled = useFeatureGate(GCP_SECURE_BOOT);
  const imdsSectionFeature = useFeatureGate(IMDS_SELECTION);
  const isCapacityReservationEnabled = useFeatureGate(CAPACITY_RESERVATION_ID_FIELD);

  const setCurrentMPId = React.useCallback(
    (id: string) => setCurrentMachinePool(machinePoolsResponse?.find((mp) => mp.id === id)),
    [setCurrentMachinePool, machinePoolsResponse],
  );

  React.useEffect(() => {
    if (machinePoolsLoading) {
      setCurrentMachinePool(undefined);
    } else if (machinePoolsResponse?.length) {
      if (machinePoolId) {
        setCurrentMPId(machinePoolId);
      } else if (isEdit) {
        setCurrentMachinePool(machinePoolsResponse[0]);
      }
    }
  }, [machinePoolsLoading, machinePoolsResponse, machinePoolId, isEdit, setCurrentMPId]);

  React.useEffect(() => {
    setIsEdit(getIsEditValue());
  }, [getIsEditValue]);

  // Checks if max nodes amount is reached for add machine pool nodes
  const isMaxReached =
    isHypershift &&
    machinePoolsResponse &&
    getNodeCount(
      machinePoolsResponse,
      isHypershift,
      currentMachinePool?.id,
      currentMachinePool?.instance_type,
    ) === getMaxNodesHCP(cluster.version?.raw_id);

  const { mutateAsync: editCreateMachineOrNodePoolMutation } = useEditCreateMachineOrNodePools(
    isHypershift,
    cluster,
    currentMachinePool,
    isCapacityReservationEnabled,
  );

  const [overviewTab, overviewContent] = useOverviewSubTab({
    cluster,
    machinePools: machinePoolsResponse || [],
    isEdit,
    region,
    currentMachinePool,
    setCurrentMPId,
    machineTypesResponse,
    machineTypesErrorResponse,
    machineTypesLoading,
    tabKey: 1,
    initialTabContentShown: STARTING_TAB_KEY === 1,
  });

  const [maintenanceTab, maintenanceContent] = useMaintenanceSubTab({
    cluster,
    tabKey: 2,
    initialTabContentShown: STARTING_TAB_KEY === 2,
  });

  const [labelsTagsTaintsTab, labelsTagsTaintsContent] = useLabelsTagsTaintsSubTab({
    cluster,
    machinePools: machinePoolsResponse || [],
    currentMachinePoolId: currentMachinePool?.id,
    machineTypes: machineTypesResponse,
    tabKey: 3,
    initialTabContentShown: STARTING_TAB_KEY === 3,
    isROSAHCP: isHypershift || false,
    isNewMachinePool: !isEdit,
  });

  const [securityGroupsTab, securityGroupsContent] = useSecurityGroupsSubTab({
    cluster,
    isReadOnly: isEdit,
    tabKey: 4,
    initialTabContentShown: STARTING_TAB_KEY === 4,
  });

  const [costSavingsTab, costSavingsContent] = useCostSavingsSubTab({
    cluster,
    isEdit,
    tabKey: 5,
    initialTabContentShown: STARTING_TAB_KEY === 5,
  });

  const isPending =
    machinePoolsLoading ||
    (!machinePoolsError && machinePoolsLoading) ||
    (!machineTypesError && machineTypesLoading) ||
    (isEdit && machineTypesResponse && machinePoolsResponse && !currentMachinePool);
  return (
    <Formik<EditMachinePoolValues>
      onSubmit={async (values) => {
        setSubmitError(undefined);
        try {
          await editCreateMachineOrNodePoolMutation({
            region,
            values,
            currentMPId: currentMachinePool?.id,
          });
          onSave?.();
          onClose();
        } catch (err) {
          setSubmitError(err as any);
        }
      }}
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
    >
      {({ isValid, submitForm, isSubmitting, values, setFieldValue, errors }) => (
        <Modal
          id="edit-mp-modal"
          onClose={isSubmitting ? undefined : onClose}
          variant={ModalVariant.medium}
          isOpen
          className="openshift"
        >
          <ModalHeader description={!isEdit && modalDescription}>
            <Title headingLevel="h1">{isEdit ? 'Edit machine pool' : 'Add machine pool'}</Title>

            {shouldDisplayClusterName ? (
              <StackItem className="modal-secondary-title">
                <Split>
                  <SplitItem>Cluster</SplitItem>
                  <SplitItem>{clusterName}</SplitItem>
                </Split>
              </StackItem>
            ) : null}
            {!isEdit ? (
              <Content component={ContentVariants.small}>{modalDescription}</Content>
            ) : null}

            {tabbedMachinePoolModalFeature &&
            !isPending &&
            !machinePoolsError &&
            !machineTypesError ? (
              <Tabs
                activeKey={activeTabKey}
                onSelect={(_e, tabIndex) => setActiveTabKey(tabIndex)}
                isSubtab
              >
                {overviewTab(errors)}
                {maintenanceTab(errors)}
                {labelsTagsTaintsTab(errors)}
                {securityGroupsTab(errors)}
                {costSavingsTab(errors)}
              </Tabs>
            ) : null}
          </ModalHeader>
          <ModalBody tabIndex={0}>
            {isPending ? (
              <div className="pf-v6-u-text-align-center">
                <Spinner size="lg" aria-label="Loading..." />
              </div>
            ) : null}

            {!isPending && (machinePoolsError || machineTypesError) ? (
              <ErrorBox
                message="Failed to fetch resources"
                response={machinePoolsError ? machinePoolsErrorResponse : machineTypesErrorResponse}
              />
            ) : null}

            {!isPending && !machinePoolsError && !machineTypesError ? (
              <div>
                {tabbedMachinePoolModalFeature ? (
                  <>
                    {overviewContent({ setFieldValue, imdsValue: values.imds })}
                    {maintenanceContent()}
                    {labelsTagsTaintsContent()}
                    {securityGroupsContent()}
                    {costSavingsContent()}
                  </>
                ) : (
                  <Form>
                    <EditDetailsSection
                      cluster={cluster}
                      machinePools={machinePoolsResponse || []}
                      isEdit={isEdit}
                      region={region}
                      currentMPId={currentMachinePool?.id}
                      setCurrentMPId={setCurrentMPId}
                      machineTypesResponse={machineTypesResponse}
                      machineTypesErrorResponse={machineTypesErrorResponse}
                      machineTypesLoading={machineTypesLoading}
                    />
                    <EditNodeCountSection
                      cluster={cluster}
                      machinePool={currentMachinePool}
                      machinePools={machinePoolsResponse || []}
                      machineTypes={machineTypesResponse}
                      allow249NodesOSDCCSROSA={allow249NodesOSDCCSROSA}
                    />
                    <AutoRepairField cluster={cluster} />
                    {imdsSectionFeature && !isEdit && isHypershift ? (
                      <ImdsSection
                        imds={values.imds}
                        isDisabled={false}
                        onChangeImds={(value) => setFieldValue(FieldId.IMDS, value)}
                      />
                    ) : null}
                    <DiskSizeField cluster={cluster} isEdit={isEdit} />
                    <CapacityReservationField cluster={cluster} isEdit={isEdit} />
                    <ExpandableSection toggleText="Edit node labels and taints">
                      <EditLabelsSection />
                      <EditTaintsSection
                        cluster={cluster}
                        machinePools={machinePoolsResponse || []}
                        machinePoolId={currentMachinePool?.id}
                        machineTypes={machineTypesResponse}
                      />
                    </ExpandableSection>
                    {isGCP && isSecureBootEnabled ? <ShieldedVM isEditModal={!!isEdit} /> : null}
                    <EditSecurityGroupsSection cluster={cluster} isReadOnly={isEdit} isExpandable />
                    {canUseSpotInstances(cluster) && <SpotInstancesSection isEdit={isEdit} />}
                  </Form>
                )}
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            {submitError && (
              <ErrorBox
                message={isEdit ? 'Error editing machine pool' : 'Error adding machine pool'}
                response={{
                  errorDetails: submitError.response?.data?.details,
                  errorMessage: getErrorMessage({ payload: submitError }),
                  operationID: submitError.response?.data.operation_id,
                }}
              />
            )}
            {isMaxReached ? (
              <Tooltip content="Maximum cluster node count limit reached">
                <SubmitButton
                  isMaxReached={isMaxReached}
                  isValid={isValid}
                  isSubmitting={isSubmitting}
                  machinePoolsResponse={machinePoolsResponse || []}
                  machineTypesResponse={machineTypesResponse}
                  initialValues={initialValues}
                  values={values}
                  submitForm={submitForm}
                  isEdit={isEdit}
                />
              </Tooltip>
            ) : (
              <SubmitButton
                isMaxReached={isMaxReached || false}
                isValid={isValid}
                isSubmitting={isSubmitting}
                machinePoolsResponse={machinePoolsResponse || []}
                machineTypesResponse={machineTypesResponse}
                initialValues={initialValues}
                values={values}
                submitForm={submitForm}
                isEdit={isEdit}
              />
            )}
            <Button
              variant="link"
              isDisabled={isSubmitting}
              onClick={onClose}
              data-testid="cancel-btn"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Formik>
  );
};

type ConnectedEditMachinePoolModalProps = {
  clearMachinePools: boolean;
};

export const ConnectedEditMachinePoolModal = ({
  clearMachinePools,
}: ConnectedEditMachinePoolModalProps) => {
  const data = useGlobalState((state) => state.modal.data);
  const dispatch = useDispatch();

  const onModalClose = () => {
    dispatch(closeModal());
  };
  const { cluster, shouldDisplayClusterName } = data as any;
  const hypershiftCluster = isHypershiftCluster(cluster);
  const clusterID = cluster?.id;
  const clusterVersionID = cluster?.version?.id;
  const clusterRawVersionID = cluster?.version?.raw_id;
  const region = cluster?.subscription?.rh_region_id;

  const {
    data: machineTypes,
    isLoading: isMachineTypesLoading,
    isError: isMachineTypesError,
    error: machineTypesError,
  } = useFetchMachineTypes(region);

  const {
    data: machinePoolData,
    isLoading: isMachinePoolLoading,
    isError: isMachinePoolError,
    error: machinePoolError,
    refetch: machinePoolOrNodePoolsRefetch,
  } = useFetchMachineOrNodePools(
    clusterID,
    hypershiftCluster,
    clusterVersionID,
    region,
    clusterRawVersionID,
  );

  const isHypershift = isHypershiftCluster(cluster);
  return cluster ? (
    <EditMachinePoolModal
      region={region}
      isHypershift={isHypershift}
      shouldDisplayClusterName={shouldDisplayClusterName}
      cluster={cluster}
      onClose={onModalClose}
      isEdit
      machineTypesResponse={machineTypes}
      machinePoolsResponse={machinePoolData}
      machinePoolsLoading={isMachinePoolLoading}
      machinePoolsError={isMachinePoolError}
      machineTypesLoading={isMachineTypesLoading}
      machineTypesError={isMachineTypesError}
      machinePoolsErrorResponse={machinePoolError?.error}
      machineTypesErrorResponse={machineTypesError?.error}
      onSave={() => {
        if (!isMachinePoolLoading) {
          machinePoolOrNodePoolsRefetch();
        }
      }}
    />
  ) : null;
};

ConnectedEditMachinePoolModal.modalName = modals.EDIT_MACHINE_POOL;

export default EditMachinePoolModal;
