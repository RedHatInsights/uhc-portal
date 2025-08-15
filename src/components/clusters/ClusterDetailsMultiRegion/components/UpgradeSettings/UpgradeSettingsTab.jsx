import React from 'react';
import { Formik } from 'formik';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Flex,
  FlexItem,
  Form,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import { knownProducts } from '~/common/subscriptionTypes';
import getClusterVersion from '~/components/clusters/common/getClusterVersion';
import { useDeleteSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule';
import { useEditSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useEditSchedule';
import {
  refetchSchedules,
  useGetSchedules,
} from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { usePostSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostSchedule';
import { useReplaceSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useReplaceSchedule';
import { useFetchMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useFetchUpgradeGatesFromApi } from '~/queries/ClusterDetailsQueries/useFetchUpgadeGatesFromApi';

import getClusterName from '../../../../../common/getClusterName';
import ButtonWithTooltip from '../../../../common/ButtonWithTooltip';
import ErrorBox from '../../../../common/ErrorBox';
import { openModal } from '../../../../common/Modal/ModalActions';
import modals from '../../../../common/Modal/modals';
import clusterStates, {
  isHibernating,
  isHypershiftCluster,
  isROSA,
} from '../../../common/clusterStates';
import MinorVersionUpgradeAlert from '../../../common/Upgrades/MinorVersionUpgradeAlert';
import UpgradeAcknowledgeWarning from '../../../common/Upgrades/UpgradeAcknowledge/UpgradeAcknowledgeWarning';
import UpgradeSettingsFields from '../../../common/Upgrades/UpgradeSettingsFields';
import UpgradeStatus from '../../../common/Upgrades/UpgradeStatus';
import UserWorkloadMonitoringSection from '../../../common/UserWorkloadMonitoringSectionMultiRegion';
import { UpdateAllMachinePools } from '../MachinePools/UpdateMachinePools';

const UpgradeSettingsTab = ({ cluster }) => {
  const dispatch = useDispatch();

  const region = cluster?.subscription?.rh_region_id;
  const clusterID = cluster.id;
  const { canEdit } = cluster;

  const isHypershift = isHypershiftCluster(cluster);
  const clusterVersion = getClusterVersion(cluster);
  const isRosa = isROSA(cluster);

  const { data: schedules, isLoading: isGetShcedulesLoading } = useGetSchedules(
    cluster.id,
    isHypershift,
    region,
  );

  const isPrevAutomatic = schedules?.items?.some((policy) => policy.schedule_type === 'automatic');

  const [confirmationModalOpen, setConfirmationModalOpen] = React.useState(false);
  const [isCurrentAutomatic, setIsCurrentAutomatic] = React.useState(false);
  const isAROCluster = cluster?.subscription?.plan.type === knownProducts.ARO;
  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const clusterHibernating = isHibernating(cluster);

  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  // a superset of hibernatingReason.
  const notReadyReason = cluster.state !== clusterStates.ready && 'This cluster is not ready';
  const formDisableReason = readOnlyReason || hibernatingReason;

  const { data: upgradeGates } = useFetchUpgradeGatesFromApi(cluster.managed, region);
  const {
    isPending: isEditSchedulesPending,
    isError: isEditSchedulesError,
    error: editSchedulesError,
    mutate: editSchedulesMutate,
  } = useEditSchedule(clusterID, isHypershift, region);
  const {
    isPending: isReplaceSchedulePending,
    isError: isReplaceScheduleError,
    error: replaceScheduleError,
    mutate: replaceScheduleMutate,
  } = useReplaceSchedule(clusterID, isHypershift, region);
  const {
    isPending: isPostSchedulePending,
    isError: isPostScheduleError,
    error: postScheduleError,
    mutate: postScheduleMutate,
  } = usePostSchedule(clusterID, isHypershift, region);
  const {
    isPending: isDeleteSchedulePending,
    isError: isDeleteScheduleError,
    error: deleteScheduleError,
    mutate: deleteScheduleMutate,
  } = useDeleteSchedule(clusterID, isHypershift, region);
  const {
    isPending: isEditClusterPending,
    isError: isEditClusterError,
    error: editClusterError,
    mutate: editClusterMutate,
    isSuccess: isEditClusterSuccess,
  } = useEditCluster(region);
  const { data: machinePoolData, isError: isMachinePoolError } = useFetchMachineOrNodePools(
    clusterID,
    isHypershift,
    clusterVersion,
    region,
    cluster?.version?.raw_id,
  );

  const isDisabled =
    isGetShcedulesLoading ||
    isReplaceSchedulePending ||
    isEditSchedulesPending ||
    isPostSchedulePending;

  const automaticUpgradePolicy = schedules?.items.find(
    (policy) => policy.schedule_type === 'automatic',
  );

  React.useEffect(() => {
    if (cluster.id && !isGetShcedulesLoading) {
      invalidateClusterDetailsQueries();
      refetchSchedules();
    }

    // mimics componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isEditClusterPending && isEditClusterSuccess) {
      invalidateClusterDetailsQueries();
      refetchSchedules();
    }
  }, [
    isEditClusterSuccess,
    isPrevAutomatic,
    isEditClusterPending,
    cluster.subscription.id,
    schedules,
  ]);

  const closeConfirmationModal = () => {
    setConfirmationModalOpen(false);
  };

  const scheduledManualUpgrade = schedules?.items.find(
    (schedule) =>
      schedule.schedule_type === 'manual' &&
      schedule.upgrade_type === (isHypershift ? 'ControlPlane' : 'OSD'),
  );

  const scheduledUpgrade = schedules?.items.find(
    (schedule) =>
      ['manual', 'automatic'].includes(schedule.schedule_type) &&
      schedule.upgrade_type === (isHypershift ? 'ControlPlane' : 'OSD'),
  );

  const upgradeStarted =
    scheduledUpgrade &&
    (scheduledUpgrade.state?.value === 'started' || scheduledUpgrade.state?.value === 'delayed');

  // eslint-disable-next-line camelcase
  const availableUpgrades = cluster?.version?.available_upgrades;

  const showUpdateButton =
    (!!cluster.openshift_version || !!cluster?.version?.id) &&
    availableUpgrades?.length > 0 &&
    !scheduledUpgrade &&
    !clusterHibernating;

  const isPending =
    isReplaceSchedulePending ||
    isEditSchedulesPending ||
    isDeleteSchedulePending ||
    isEditClusterPending;

  const disableUVM = !!(readOnlyReason || hibernatingReason || notReadyReason);

  const hibernatingClusterInfo = (
    <Alert
      variant="info"
      className="pf-v6-u-mb-md"
      isInline
      title="Version updates will not occur while this cluster is Hibernating.
          Once resumed, updates will start according to the selected updates strategy."
    />
  );

  return (
    <Grid hasGutter className="ocm-c-upgrade-monitoring">
      {isEditClusterError && (
        <GridItem>
          <ErrorBox
            response={{
              errorMessage: editClusterError?.message || editClusterError?.errorMessage,
              operationID: editClusterError?.operationID,
            }}
            message="Error processing request"
          />
        </GridItem>
      )}
      <Formik
        enableReinitialize
        initialValues={{
          upgrade_policy: automaticUpgradePolicy ? 'automatic' : 'manual',
          automatic_upgrade_schedule: automaticUpgradePolicy?.schedule || '0 0 * * 0',
          node_drain_grace_period: cluster.node_drain_grace_period?.value || 60,
          enable_user_workload_monitoring: !cluster.disable_user_workload_monitoring || false,
        }}
        onSubmit={async (values) => {
          const currentAutomaticUpgradePolicy = schedules.items.find(
            (policy) => policy.schedule_type === 'automatic',
          );
          const currentManualUpgradePolicy = schedules.items.find(
            (policy) => policy.schedule_type === 'manual',
          );
          if (values.upgrade_policy === 'automatic') {
            if (
              currentAutomaticUpgradePolicy &&
              currentAutomaticUpgradePolicy !== values.automatic_upgrade_schedule
            ) {
              // automatic policy needs an update
              editSchedulesMutate(
                {
                  policyID: currentAutomaticUpgradePolicy.id,
                  schedule: {
                    schedule: values.automatic_upgrade_schedule,
                  },
                },
                {
                  onSuccess: () => refetchSchedules(),
                },
              );
            } else if (!currentAutomaticUpgradePolicy) {
              const newSchedule = {
                schedule_type: 'automatic',
                schedule: values.automatic_upgrade_schedule,
              };
              if (currentManualUpgradePolicy) {
                // replace manual update schedule with the new automatic schedule
                const currentManualUpgradePolicyID = currentManualUpgradePolicy.id;
                replaceScheduleMutate(
                  { oldScheduleID: currentManualUpgradePolicyID, newSchedule },
                  {
                    onSuccess: () => refetchSchedules(),
                  },
                );
              } else {
                // create a new automatic policy
                postScheduleMutate(newSchedule, {
                  onSuccess: () => refetchSchedules(),
                });
              }
            }
          } else if (currentAutomaticUpgradePolicy) {
            // delete
            const currentAutomaticUpgradePolicyID = currentAutomaticUpgradePolicy.id;
            deleteScheduleMutate(currentAutomaticUpgradePolicyID, {
              onSuccess: () => refetchSchedules(),
            });
          }

          const clusterBody = {};
          if (cluster.node_drain_grace_period !== values.node_drain_grace_period) {
            // update grace period on the cluster
            clusterBody.node_drain_grace_period = {
              value: values.node_drain_grace_period,
            };
          }
          if (
            !cluster.disable_user_workload_monitoring !== values.enable_user_workload_monitoring
          ) {
            clusterBody.disable_user_workload_monitoring = !values.enable_user_workload_monitoring;
          }
          if (!isEmpty(clusterBody)) {
            editClusterMutate(
              {
                clusterID: cluster.id,
                cluster: clusterBody,
              },
              {
                onSuccess: () => invalidateClusterDetailsQueries(),
              },
            );
          }
        }}
      >
        {(formik) => {
          if (formik.values.upgrade_policy === 'automatic' && formik.dirty && !isCurrentAutomatic) {
            setConfirmationModalOpen(true);
            setIsCurrentAutomatic(true);
          }

          return (
            <>
              {!isAROCluster && !isHypershift && (
                <GridItem>
                  <Card>
                    <CardBody>
                      <UserWorkloadMonitoringSection
                        parent="details"
                        disableUVM={disableUVM}
                        planType={cluster.subscription?.plan?.type}
                      />
                    </CardBody>
                  </Card>
                </GridItem>
              )}
              <GridItem lg={9} md={12} className="ocm-c-upgrade-monitoring-top">
                <Card>
                  <CardTitle>Update strategy</CardTitle>
                  <CardBody>
                    {confirmationModalOpen && scheduledManualUpgrade && (
                      <Modal
                        id="recurring-updates-confirm-modal"
                        variant={ModalVariant.small}
                        isOpen
                        onClose={() => {
                          closeConfirmationModal();
                          formik.resetForm();
                        }}
                        aria-labelledby="recurring-updates-confirm-modal"
                        aria-describedby="modal-box-recurring-updates-confirm"
                      >
                        <ModalHeader
                          title="Recurring updates"
                          labelId="recurring-updates-confirm-modal"
                        />
                        <ModalBody>
                          By choosing recurring updates, any individually scheduled update will be
                          cancelled. Are you sure you want to continue?
                        </ModalBody>
                        <ModalFooter>
                          <Button key="confirm" variant="primary" onClick={closeConfirmationModal}>
                            Yes, cancel scheduled update
                          </Button>
                          <Button
                            key="cancel"
                            variant="secondary"
                            onClick={() => {
                              closeConfirmationModal();
                              formik.resetForm();
                            }}
                          >
                            No, keep scheduled update
                          </Button>
                        </ModalFooter>
                      </Modal>
                    )}
                    {clusterHibernating && hibernatingClusterInfo}
                    {(isPostScheduleError || isReplaceScheduleError || isEditSchedulesError) && (
                      <ErrorBox
                        response={postScheduleError || replaceScheduleError || editSchedulesError}
                        message="Can't schedule upgrade"
                      />
                    )}
                    {isDeleteScheduleError && (
                      <ErrorBox response={deleteScheduleError} message="Can't unschedule upgrade" />
                    )}

                    <UpgradeAcknowledgeWarning
                      isHypershift={isHypershift}
                      isSTSEnabled={cluster?.aws?.sts?.enabled}
                      upgradeGates={upgradeGates}
                      schedules={schedules}
                      cluster={cluster}
                    />
                    <MinorVersionUpgradeAlert
                      clusterId={cluster?.id}
                      upgradeGates={upgradeGates}
                      schedules={schedules}
                      cluster={cluster}
                      isHypershift={isHypershift}
                    />
                    <UpdateAllMachinePools
                      goToMachinePoolTab
                      isHypershift={isHypershift}
                      clusterId={clusterID}
                      controlPlaneVersion={clusterVersion}
                      controlPlaneRawVersion={cluster.version.raw_id}
                      isMachinePoolError={isMachinePoolError}
                      machinePoolData={machinePoolData}
                      region={region}
                    />

                    <Form>
                      <Grid hasGutter>
                        <UpgradeSettingsFields
                          isDisabled={!!formDisableReason}
                          initialScheduleValue={formik.initialValues.automatic_upgrade_schedule}
                          showDivider
                          isHypershift={isHypershift}
                          product={cluster?.product?.id}
                          isRosa={isRosa}
                        />
                      </Grid>
                    </Form>
                  </CardBody>
                  <CardFooter>
                    <Flex>
                      <FlexItem>
                        <ButtonWithTooltip
                          disableReason={
                            formDisableReason || (!formik.dirty && 'No changes to save')
                          }
                          isAriaDisabled={isDisabled || upgradeStarted}
                          variant="primary"
                          onClick={formik.submitForm}
                          isLoading={isPending}
                        >
                          Save
                        </ButtonWithTooltip>
                      </FlexItem>
                      <FlexItem>
                        <ButtonWithTooltip
                          isDisabled={!formik.dirty}
                          variant="link"
                          onClick={formik.resetForm}
                          isInline={false}
                        >
                          Cancel
                        </ButtonWithTooltip>
                      </FlexItem>
                    </Flex>
                  </CardFooter>
                </Card>
              </GridItem>
            </>
          );
        }}
      </Formik>
      <GridItem lg={3} md={12} className="ocm-c-upgrade-monitoring-top">
        <Card>
          <CardTitle>Update status</CardTitle>
          <CardBody>
            <UpgradeStatus
              clusterID={clusterID}
              canEdit={canEdit}
              clusterVersion={clusterVersion}
              scheduledUpgrade={scheduledUpgrade}
              availableUpgrades={availableUpgrades}
              upgradeGates={upgradeGates}
              schedules={schedules}
              cluster={cluster}
              region={region}
              isHypershift={isHypershift}
              isSTSEnabled={cluster?.aws?.sts?.enabled}
            />
            {showUpdateButton && (
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch(
                    openModal(modals.UPGRADE_WIZARD, {
                      clusterName: getClusterName(cluster),
                      subscriptionID: cluster?.subscription.id,
                    }),
                  )
                }
              >
                Update
              </Button>
            )}
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

UpgradeSettingsTab.propTypes = {
  cluster: PropTypes.shape({
    node_drain_grace_period: PropTypes.shape({
      value: PropTypes.string,
    }),
    disable_user_workload_monitoring: PropTypes.bool,
    aws: PropTypes.shape({
      sts: PropTypes.shape({
        enabled: PropTypes.bool,
      }),
    }),
    managed: PropTypes.bool,
    canEdit: PropTypes.bool,
    status: PropTypes.shape({
      configuration_mode: PropTypes.string,
    }),
    openshift_version: PropTypes.string,
    id: PropTypes.string,
    subscription: PropTypes.shape({
      id: PropTypes.string,
      plan: PropTypes.shape({ type: PropTypes.string }),
      rh_region_id: PropTypes.string,
    }),
    version: PropTypes.shape({
      channel_group: PropTypes.string,
      available_upgrades: PropTypes.arrayOf(PropTypes.string),
      raw_id: PropTypes.string,
      id: PropTypes.string,
    }),
    state: PropTypes.string,
    product: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};

export default UpgradeSettingsTab;
