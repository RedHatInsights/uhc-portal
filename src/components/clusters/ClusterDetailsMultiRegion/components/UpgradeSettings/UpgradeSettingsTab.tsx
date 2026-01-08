import React, { useMemo } from 'react';
import { Formik } from 'formik';
import isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';

import {
  Alert,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Flex,
  FlexItem,
  Form,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { knownProducts } from '~/common/subscriptionTypes';
import getClusterVersion from '~/components/clusters/common/getClusterVersion';
import { getToVersionFromHelper } from '~/components/clusters/common/Upgrades/UpgradeAcknowledge/UpgradeAcknowledgeHelpers';
import { useDeleteSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useDeleteSchedule';
import { useEditSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useEditSchedule';
import { useFetchUnmetAcknowledgements } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useFetchUnmetAcknowledgements';
import {
  refetchSchedules,
  useGetSchedules,
} from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { usePostSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostSchedule';
import { useReplaceSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useReplaceSchedule';
import { useFetchMachineOrNodePools } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { useEditCluster } from '~/queries/ClusterDetailsQueries/useEditCluster';
import { invalidateClusterDetailsQueries } from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { UpgradePolicy, VersionGate } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster, UpgradePolicyWithState } from '~/types/types';

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
import MinorVersionUpgradeAlert from '../../../common/Upgrades/MinorVersionUpgradeAlert/MinorVersionUpgradeAlert';
import UpgradeAcknowledgeWarning from '../../../common/Upgrades/UpgradeAcknowledge/UpgradeAcknowledgeWarning/UpgradeAcknowledgeWarning';
import UpgradeSettingsFields from '../../../common/Upgrades/UpgradeSettingsFields';
import UpgradeStatus from '../../../common/Upgrades/UpgradeStatus';
import UserWorkloadMonitoringSection from '../../../common/UserWorkloadMonitoringSectionMultiRegion';
import { UpdateAllMachinePools } from '../MachinePools/UpdateMachinePools';

interface UpgradeSettingsFormValues {
  upgrade_policy: 'automatic' | 'manual';
  automatic_upgrade_schedule: string;
  node_drain_grace_period: number;
  enable_user_workload_monitoring: boolean;
}

interface UpgradeSettingsTabProps {
  cluster: AugmentedCluster;
}

const UpgradeSettingsTab = ({ cluster }: UpgradeSettingsTabProps) => {
  const dispatch = useDispatch();

  const region = cluster?.subscription?.rh_region_id;
  const clusterID = cluster.id || '';
  const { canEdit } = cluster;

  const isHypershift = isHypershiftCluster(cluster);
  const clusterVersion = getClusterVersion(cluster);
  const isRosa = isROSA(cluster);

  const { data: schedulesData, isLoading: isGetShcedulesLoading } = useGetSchedules(
    clusterID,
    isHypershift,
    region,
  );
  const schedules = useMemo(() => schedulesData?.items || [], [schedulesData]);
  const isPrevAutomatic = schedules.some(
    (policy: UpgradePolicy) => policy.schedule_type === 'automatic',
  );

  const isAROCluster = cluster?.subscription?.plan?.type === knownProducts.ARO;
  const isReadOnly = cluster?.status?.configuration_mode === 'read_only';
  const clusterHibernating = isHibernating(cluster);

  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  // a superset of hibernatingReason.
  const notReadyReason = cluster.state !== clusterStates.ready && 'This cluster is not ready';
  const formDisableReason = readOnlyReason || hibernatingReason;

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
  const {
    data: unmetAcknowledgements,
    hasVersionGates,
    mutate: unmetAcknowledgementsMutate,
  } = useFetchUnmetAcknowledgements(clusterID || '', isHypershift, region);

  const isDisabled =
    isGetShcedulesLoading ||
    isReplaceSchedulePending ||
    isEditSchedulesPending ||
    isPostSchedulePending;
  const automaticUpgradePolicy = schedules.find(
    (policy: UpgradePolicy) => policy.schedule_type === 'automatic',
  );
  React.useEffect(() => {
    if (cluster.id && !isGetShcedulesLoading) {
      invalidateClusterDetailsQueries();
      refetchSchedules();
    }

    // mimics componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upgradeToVersion = useMemo(
    () => getToVersionFromHelper(schedules, cluster),
    [schedules, cluster],
  );
  React.useEffect(() => {
    // DryRun calls can only be made when there are no existing schedules
    if (schedules.length === 0) {
      unmetAcknowledgementsMutate({
        version: automaticUpgradePolicy?.version ? undefined : upgradeToVersion, // defaults to highest available version
        schedule_type: automaticUpgradePolicy ? 'automatic' : 'manual',
        schedule: automaticUpgradePolicy?.schedule ? automaticUpgradePolicy?.schedule : undefined,
        upgrade_type: isHypershift ? 'ControlPlane' : 'OSD',
        next_run: new Date(new Date().getTime() + 6 * 60000).toISOString(),
      } as UpgradePolicy);
    }
  }, [
    upgradeToVersion,
    unmetAcknowledgementsMutate,
    automaticUpgradePolicy,
    schedules,
    isHypershift,
  ]);

  React.useEffect(() => {
    if (!isEditClusterPending && isEditClusterSuccess) {
      invalidateClusterDetailsQueries();
      refetchSchedules();
    }
  }, [
    isEditClusterSuccess,
    isPrevAutomatic,
    isEditClusterPending,
    cluster.subscription?.id,
    schedules,
  ]);

  const scheduledManualUpgrade = schedules.find(
    (schedule: UpgradePolicy) =>
      schedule.schedule_type === 'manual' &&
      schedule.upgrade_type === (isHypershift ? 'ControlPlane' : 'OSD'),
  );

  const scheduledUpgrade: UpgradePolicyWithState | undefined = schedules.find(
    (schedule: UpgradePolicyWithState) =>
      ['manual', 'automatic'].includes(schedule.schedule_type || '') &&
      schedule.upgrade_type === (isHypershift ? 'ControlPlane' : 'OSD'),
  );

  const upgradeStarted =
    scheduledUpgrade &&
    (scheduledUpgrade.state?.value === 'started' || scheduledUpgrade.state?.value === 'delayed');

  // eslint-disable-next-line camelcase
  const availableUpgrades = cluster?.version?.available_upgrades;

  const showUpdateButton =
    (!!cluster.openshift_version || !!cluster?.version?.id) &&
    (availableUpgrades?.length || 0) > 0 &&
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

  const handleSubmit = async (values: UpgradeSettingsFormValues): Promise<void> => {
    const currentAutomaticUpgradePolicy = schedules.find(
      (policy: UpgradePolicy) => policy.schedule_type === 'automatic',
    );
    const currentManualUpgradePolicy = schedules.find(
      (policy: UpgradePolicy) => policy.schedule_type === 'manual',
    );

    if (values.upgrade_policy === 'automatic') {
      if (
        currentAutomaticUpgradePolicy &&
        currentAutomaticUpgradePolicy.schedule !== values.automatic_upgrade_schedule
      ) {
        // automatic policy needs an update
        editSchedulesMutate(
          {
            policyID: currentAutomaticUpgradePolicy.id || '',
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
          schedule_type: 'automatic' as const,
          schedule: values.automatic_upgrade_schedule,
        };
        if (currentManualUpgradePolicy) {
          // replace manual update schedule with the new automatic schedule
          const currentManualUpgradePolicyID = currentManualUpgradePolicy.id || '';
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
      const currentAutomaticUpgradePolicyID = currentAutomaticUpgradePolicy.id || '';
      deleteScheduleMutate(currentAutomaticUpgradePolicyID, {
        onSuccess: () => refetchSchedules(),
      });
    }

    const clusterBody: {
      node_drain_grace_period?: { value: number };
      disable_user_workload_monitoring?: boolean;
    } = {};

    if (cluster?.node_drain_grace_period?.value !== values.node_drain_grace_period) {
      // update grace period on the cluster
      clusterBody.node_drain_grace_period = {
        value: values.node_drain_grace_period,
      };
    }
    if (!cluster.disable_user_workload_monitoring !== values.enable_user_workload_monitoring) {
      clusterBody.disable_user_workload_monitoring = !values.enable_user_workload_monitoring;
    }
    if (!isEmpty(clusterBody)) {
      editClusterMutate(
        {
          clusterID: cluster.id || '',
          cluster: clusterBody,
        },
        {
          onSuccess: () => invalidateClusterDetailsQueries(),
        },
      );
    }
  };

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
          node_drain_grace_period: (cluster.node_drain_grace_period?.value as number) || 60,
          enable_user_workload_monitoring: !cluster.disable_user_workload_monitoring || false,
        }}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <>
            {!isAROCluster && !isHypershift && (
              <GridItem>
                <Card>
                  <CardBody>
                    <UserWorkloadMonitoringSection
                      parent="details"
                      disableUVM={disableUVM}
                      planType={cluster.subscription?.plan?.type}
                      rosaMonitoringLink={
                        isHypershift ? links.ROSA_MONITORING : links.ROSA_CLASSIC_MONITORING
                      }
                    />
                  </CardBody>
                </Card>
              </GridItem>
            )}
            <GridItem lg={9} md={12} className="ocm-c-upgrade-monitoring-top">
              <Card>
                <CardTitle>Update strategy</CardTitle>
                <CardBody>
                  {clusterHibernating && hibernatingClusterInfo}
                  {(isPostScheduleError || isReplaceScheduleError || isEditSchedulesError) && (
                    <ErrorBox
                      response={
                        postScheduleError || replaceScheduleError || editSchedulesError || {}
                      }
                      message="Can't schedule upgrade"
                    />
                  )}
                  {isDeleteScheduleError && (
                    <ErrorBox response={deleteScheduleError} message="Can't unschedule upgrade" />
                  )}

                  <UpgradeAcknowledgeWarning
                    isHypershift={isHypershift}
                    schedules={schedules}
                    cluster={cluster}
                    unmetAcknowledgements={unmetAcknowledgements as VersionGate[]}
                  />
                  <MinorVersionUpgradeAlert
                    clusterId={cluster?.id || ''}
                    schedules={schedules}
                    cluster={cluster}
                    isHypershift={isHypershift}
                    hasUnmetAcknowledgements={hasVersionGates}
                  />
                  <UpdateAllMachinePools
                    goToMachinePoolTab
                    isHypershift={isHypershift}
                    clusterId={clusterID}
                    controlPlaneVersion={clusterVersion}
                    controlPlaneRawVersion={cluster.version?.raw_id || ''}
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
                        isRosa={isRosa}
                        scheduledManualUpgrade={scheduledManualUpgrade}
                      />
                    </Grid>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Flex>
                    <FlexItem>
                      <ButtonWithTooltip
                        disableReason={
                          formDisableReason ||
                          (!formik.dirty && 'No changes to save') ||
                          notReadyReason
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
                        onClick={() => formik.resetForm()}
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
        )}
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
              availableUpgrades={availableUpgrades || ([] as any)}
              schedules={schedules}
              cluster={cluster}
              isHypershift={isHypershift}
              isSTSEnabled={cluster?.aws?.sts?.enabled}
              unmetAcknowledgements={unmetAcknowledgements as VersionGate[]}
            />
            {showUpdateButton && (
              <ButtonWithTooltip
                variant="secondary"
                onClick={() => {
                  dispatch(
                    openModal(modals.UPGRADE_WIZARD, {
                      clusterName: getClusterName(cluster),
                      subscriptionID: cluster?.subscription?.id,
                    }),
                  );
                }}
                disableReason={notReadyReason}
              >
                Update
              </ButtonWithTooltip>
            )}
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default UpgradeSettingsTab;
