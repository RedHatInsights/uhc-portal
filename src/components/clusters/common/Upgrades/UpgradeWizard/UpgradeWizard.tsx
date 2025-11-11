import React from 'react';
import { useDispatch } from 'react-redux';

import {
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalVariant,
  Spinner,
  Timestamp,
  TimestampFormat,
  Title,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';

import { ModalWizardHeader } from '~/components/clusters/wizards/common/ModalWizardHeader/ModalWizardHeader';
import ErrorBox from '~/components/common/ErrorBox';
import { useFetchUnmetAcknowledgements } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useFetchUnmetAcknowledgements';
import { refetchSchedules } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { usePostClusterGateAgreementAcknowledgeModal } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostClusterGateAgreement';
import { usePostSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/usePostSchedule';
import {
  invalidateClusterDetailsQueries,
  useFetchClusterDetails,
} from '~/queries/ClusterDetailsQueries/useFetchClusterDetails';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { UpgradePolicy, VersionGate } from '~/types/clusters_mgmt.v1';

import { modalActions } from '../../../../common/Modal/ModalActions';
import modals from '../../../../common/Modal/modals';
import { isHypershiftCluster } from '../../clusterStates';
import UpgradeAcknowledgeStep from '../UpgradeAcknowledge/UpgradeAcknowledgeStep';

import VersionSelectionGrid from './VersionSelectionGrid/VersionSelectionGrid';
import FinishedStep from './FinishedStep';
import UpgradeTimeSelection from './UpgradeTimeSelection';

import './UpgradeWizard.scss';

interface UpgradeWizardModalData {
  clusterName: string;
  subscriptionID: string;
}

interface ScheduleData {
  timestamp?: string;
  type: 'now' | 'time';
}

const UpgradeWizard = () => {
  const dispatch = useDispatch();
  const [selectedVersion, setSelectedVersion] = React.useState<string | undefined>(undefined);
  const [upgradeTimestamp, setUpgradeTimestamp] = React.useState<string | undefined>(undefined);
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [scheduleType, setScheduleType] = React.useState<'now' | 'time'>('now');
  const modalData = useGlobalState((state) => state.modal.data as UpgradeWizardModalData);
  const { subscriptionID, clusterName } = modalData;

  const {
    cluster,
    isLoading: isClusterDetailsLoading,
    isSuccess: isClusterDetailsSuccess,
  } = useFetchClusterDetails(subscriptionID);

  const clusterID = cluster?.id;
  const region = cluster?.subscription?.rh_region_id;
  const isHypershift = isHypershiftCluster(cluster);

  const { mutateAsync: postClusterGateAgreementMutate } =
    usePostClusterGateAgreementAcknowledgeModal(clusterID || '', region);
  const {
    mutate: postScheduleMutate,
    isError: isPostScheduleError,
    error: postScheduleError,
    isPending: isPostSchedulePending,
    isSuccess: isPostScheduleSuccess,
  } = usePostSchedule(clusterID || '', isHypershift, region);

  const {
    data: unmetAcknowledgements,
    hasVersionGates,
    mutate: unmetAcknowledgementsMutate,
    isError: isUnmetAcknowledgementsError,
    error: unmetAcknowledgementsError,
    isPending: isUnmetAcknowledgementsPending,
    isSuccess: isUnmetAcknowledgementsSuccess,
  } = useFetchUnmetAcknowledgements(clusterID || '', isHypershift, region);

  const isPending =
    (isClusterDetailsLoading && !isClusterDetailsSuccess) ||
    cluster?.subscription?.id !== subscriptionID;

  const gotAllDetails = !!(
    selectedVersion &&
    (upgradeTimestamp || scheduleType === 'now') &&
    ((hasVersionGates && acknowledged) || !hasVersionGates) &&
    !isUnmetAcknowledgementsError &&
    !isUnmetAcknowledgementsPending
  );

  const [isWizardDone, setIsWizardDone] = React.useState(false);

  const close = () => {
    refetchSchedules();
    invalidateClusterDetailsQueries();
    setSelectedVersion(undefined);
    setUpgradeTimestamp(undefined);
    setScheduleType('now');
    dispatch(modalActions.closeModal());
  };
  const MINUTES_IN_MS = 1000 * 60;

  const selectVersion = (version: string) => {
    if (version) {
      unmetAcknowledgementsMutate({
        version,
        schedule_type: 'manual',
        upgrade_type: isHypershiftCluster(cluster) ? 'ControlPlane' : 'OSD',
        next_run: new Date(new Date().getTime() + 6 * MINUTES_IN_MS).toISOString(),
      } as UpgradePolicy);
      setSelectedVersion(version);
    }
  };

  const setSchedule = ({ timestamp, type }: ScheduleData) => {
    setUpgradeTimestamp(timestamp);
    setScheduleType(type);
  };

  const onSave = () => {
    setIsWizardDone(true);
    const nextRun =
      scheduleType === 'now'
        ? new Date(new Date().getTime() + 6 * MINUTES_IN_MS).toISOString()
        : upgradeTimestamp!;

    let error: Error | null = null;
    let promises: Promise<unknown>;
    const upgradeGateIds: string[] = (unmetAcknowledgements as VersionGate[])?.map(
      (upgradeGate: VersionGate) => upgradeGate.id || '',
    );
    if (!error) {
      promises = postClusterGateAgreementMutate(upgradeGateIds || [], {
        onError: (e) => {
          error = e;
        },
      });
    }

    promises!.then(() => {
      if (!error) {
        const schedule: UpgradePolicy = {
          schedule_type: 'manual',
          upgrade_type: isHypershiftCluster(cluster) ? 'ControlPlane' : 'OSD',
          next_run: nextRun,
          version: selectedVersion!,
        };
        postScheduleMutate(schedule);
      }
    });
  };

  return (
    <Modal
      isOpen
      aria-label="Wizard modal"
      onEscapePress={() => close()}
      onClose={() => close()}
      variant={ModalVariant.large}
      className="openshift ocm-upgrade-wizard__modal"
    >
      <ModalWizardHeader title="Update cluster" description={clusterName} />

      {isWizardDone ? (
        <ModalBody>
          <FinishedStep
            scheduleType={scheduleType}
            upgradeTimestamp={upgradeTimestamp}
            postScheduleError={postScheduleError || unmetAcknowledgementsError}
            isPostScheduleError={isPostScheduleError || isUnmetAcknowledgementsError}
            isPostSchedulePending={isPostSchedulePending || isUnmetAcknowledgementsPending}
            isPostScheduleSuccess={isPostScheduleSuccess && isUnmetAcknowledgementsSuccess}
            close={close}
          />
        </ModalBody>
      ) : (
        <Wizard onClose={() => close()} onSave={() => onSave()} className="ocm-upgrade-wizard">
          <WizardStep
            name="Select version"
            id="select-version"
            footer={{
              isNextDisabled:
                !selectedVersion ||
                isPostSchedulePending ||
                isUnmetAcknowledgementsError ||
                isUnmetAcknowledgementsPending,
            }}
          >
            {isPending ? (
              <div className="pf-v6-u-text-align-center">
                <Spinner size="lg" aria-label="Loading..." />
              </div>
            ) : (
              <>
                {isUnmetAcknowledgementsError && (
                  <Grid hasGutter>
                    <GridItem span={1} />
                    <GridItem span={10}>
                      <ErrorBox
                        response={{
                          errorMessage: unmetAcknowledgementsError?.reason,
                          operationID: unmetAcknowledgementsError?.operationID,
                        }}
                        message="A problem occurred with that selected version"
                      />
                    </GridItem>
                    <GridItem span={1} />
                  </Grid>
                )}
                <VersionSelectionGrid
                  availableUpgrades={cluster?.version?.available_upgrades}
                  clusterVersion={cluster?.openshift_version || cluster?.version?.id || ''}
                  selected={selectedVersion}
                  onSelect={selectVersion}
                  isUnMetClusterAcknowledgements={hasVersionGates}
                  isPending={isUnmetAcknowledgementsPending}
                />
              </>
            )}
          </WizardStep>

          {selectedVersion && hasVersionGates ? (
            <WizardStep
              name="Administrator acknowledgement"
              id="acknowledge_upgrade"
              footer={{ isNextDisabled: !gotAllDetails }}
              isDisabled={!selectedVersion}
            >
              <UpgradeAcknowledgeStep
                confirmed={(isConfirmed: boolean) => {
                  setAcknowledged(isConfirmed);
                }}
                unmetAcknowledgements={unmetAcknowledgements as VersionGate[]}
                fromVersion={cluster?.openshift_version || ''}
                toVersion={selectedVersion}
                initiallyConfirmed={acknowledged}
              />
            </WizardStep>
          ) : null}

          <WizardStep
            name="Schedule update"
            id="schedule-upgrade"
            footer={{ isNextDisabled: !gotAllDetails }}
            isDisabled={!gotAllDetails}
          >
            <UpgradeTimeSelection
              onSet={setSchedule}
              timestamp={upgradeTimestamp || ''}
              type={scheduleType}
            />
          </WizardStep>

          <WizardStep
            name="Confirmation"
            id="in-modal-review-step"
            footer={{ nextButtonText: 'Confirm update' }}
            isDisabled={!gotAllDetails}
          >
            <>
              <Title className="wizard-step-title" size="lg" headingLevel="h3">
                Confirmation of your update
              </Title>
              <dl className="wizard-step-body cluster-upgrade-dl">
                <div>
                  <dt>Version</dt>
                  <dd>
                    {cluster?.openshift_version} &rarr; {selectedVersion}
                  </dd>
                </div>
                {hasVersionGates ? (
                  <div>
                    <dt>Administrator acknowledgement</dt>
                    <dd>{acknowledged ? 'Approved' : 'Not approved'}</dd>
                  </div>
                ) : null}

                <dt>Scheduled</dt>
                <dd>
                  {scheduleType === 'now' ? (
                    'Within the next hour'
                  ) : (
                    <dl>
                      <dt>UTC</dt>
                      <dd>
                        <Timestamp
                          date={new Date(upgradeTimestamp!)}
                          shouldDisplayUTC
                          locale="eng-GB"
                          dateFormat={TimestampFormat.medium}
                          timeFormat={TimestampFormat.short}
                        />
                      </dd>
                      <div>
                        <dt>Local time</dt>
                        <dd>
                          <Timestamp
                            date={new Date(upgradeTimestamp!)}
                            locale="eng-GB"
                            dateFormat={TimestampFormat.long}
                            timeFormat={TimestampFormat.full}
                          />
                        </dd>
                      </div>
                    </dl>
                  )}
                </dd>
              </dl>
            </>
          </WizardStep>
        </Wizard>
      )}
    </Modal>
  );
};

UpgradeWizard.modalName = modals.UPGRADE_WIZARD;

export default UpgradeWizard;
